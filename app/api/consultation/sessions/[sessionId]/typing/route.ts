import { NextResponse } from "next/server"

import {
  type ConsultationRealtimeEvent,
  publishConsultationEvent,
} from "@/lib/consultation-realtime"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser()
  const { sessionId } = await params

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  const session = await db.consultationSession.findUnique({
    where: { id: sessionId },
    select: { patientId: true, pharmacistId: true },
  })

  if (!session || (session.patientId !== user.id && session.pharmacistId !== user.id)) {
    return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const isTyping = body?.isTyping === true
  const event: ConsultationRealtimeEvent = {
    type: "typing",
    sessionId,
    userIds: [session.patientId, session.pharmacistId],
    userId: user.id,
    isTyping,
  }
  const payload = JSON.stringify(event)

  publishConsultationEvent(event)
  await db.$executeRaw`SELECT pg_notify('consultation_message', ${payload})`

  return NextResponse.json({ ok: true })
}
