import { NextResponse } from "next/server"

import {
  type ConsultationRealtimeEvent,
  ensureConsultationListener,
  subscribeToConsultation,
} from "@/lib/consultation-realtime"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser()
  const { sessionId } = await params

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 401 })
  }

  const session = await db.consultationSession.findUnique({
    where: { id: sessionId },
    select: { patientId: true, pharmacistId: true },
  })

  if (!session || (session.patientId !== user.id && session.pharmacistId !== user.id)) {
    return NextResponse.json({ error: "Kamu tidak punya akses ke sesi ini." }, { status: 404 })
  }

  await ensureConsultationListener()

  const encoder = new TextEncoder()
  let cleanup = (_closeStream?: boolean) => {}

  const stream = new ReadableStream({
    start(controller) {
      let closed = false
      const send = (event: ConsultationRealtimeEvent) => {
        if (event.type === "typing" && event.userId === user.id) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }
      const unsubscribe = subscribeToConsultation(sessionId, send)
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"))
      }, 15000)

      cleanup = (closeStream = false) => {
        if (closed) return
        closed = true
        clearInterval(heartbeat)
        unsubscribe()
        if (closeStream) controller.close()
      }

      request.signal.addEventListener("abort", () => cleanup(true), { once: true })
      controller.enqueue(encoder.encode("retry: 3000\n\n"))
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  })
}
