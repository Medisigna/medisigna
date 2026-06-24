import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET() {
  const user = await getCurrentUser()

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  const isPatient = user.role === "PATIENT"
  const sessions = await db.consultationSession.findMany({
    where: isPatient ? { patientId: user.id } : { pharmacistId: user.id },
    include: {
      ...(isPatient ? { pharmacist: true } : { patient: true }),
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({
    sessions: sessions.map((session: any) => {
      const lastMessage = session.messages[0]

      return {
        id: session.id,
        name: isPatient ? session.pharmacist.name : session.patient.name,
        status: session.status,
        lastMessage: messagePreview(lastMessage),
        updatedAt: session.updatedAt.toISOString(),
        unreadCount: isPatient
          ? session.patientUnreadCount
          : session.pharmacistUnreadCount,
      }
    }),
  })
}

function messagePreview(message?: { type: string; body?: string | null }) {
  if (!message) return "Belum ada pesan."
  if (message.type === "SUMMARY") return "Ringkasan konseling"
  if (message.body) return message.body
  if (message.type === "IMAGE") return "Gambar"
  return "Pesan baru"
}
