import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function GET() {
  const user = await getCurrentUser()

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  const isPatient = user.role === "PATIENT"
  const result = await db.consultationSession.aggregate({
    where: isPatient ? { patientId: user.id } : { pharmacistId: user.id },
    _sum: isPatient
      ? { patientUnreadCount: true }
      : { pharmacistUnreadCount: true },
  })

  return NextResponse.json({
    unreadCount: isPatient
      ? result._sum.patientUnreadCount ?? 0
      : result._sum.pharmacistUnreadCount ?? 0,
  })
}
