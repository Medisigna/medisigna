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

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser()
  const { sessionId } = await params

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  const session = await db.consultationSession.findUnique({
    where: { id: sessionId },
    select: {
      patientId: true,
      pharmacistId: true,
      patientUnreadCount: true,
      pharmacistUnreadCount: true,
    },
  })

  if (!session || (session.patientId !== user.id && session.pharmacistId !== user.id)) {
    return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 })
  }

  const unreadCount =
    session.patientId === user.id
      ? session.patientUnreadCount
      : session.pharmacistUnreadCount

  if (!unreadCount) return NextResponse.json({ ok: true })

  const event: ConsultationRealtimeEvent = {
    type: "refresh",
    sessionId,
    userIds: [session.patientId, session.pharmacistId],
  }

  await db.$transaction(async (tx: any) => {
    await tx.consultationSession.update({
      where: { id: sessionId },
      data:
        session.patientId === user.id
          ? { patientUnreadCount: 0 }
          : { pharmacistUnreadCount: 0 },
    })

    const payload = JSON.stringify(event)
    await tx.$executeRaw`SELECT pg_notify('consultation_message', ${payload})`
  })

  publishConsultationEvent(event)
  return NextResponse.json({ ok: true })
}
