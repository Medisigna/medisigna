"use server"

import { db } from "@/lib/db"
import {
  type ConsultationRealtimeEvent,
  publishConsultationEvent,
} from "@/lib/consultation-realtime"
import { requireRole } from "@/lib/session"

const finalStatuses = ["COMPLETED", "REFERRED"]

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim()
}

export async function saveConsultationSummary(formData: FormData) {
  const user = await requireRole("PHARMACIST")
  const sessionId = field(formData, "sessionId")
  const title = field(formData, "title")
  const description = field(formData, "description")
  const status = field(formData, "status")

  if (!title || !description || !finalStatuses.includes(status)) {
    return { ok: false, error: "Ringkasan wajib diisi lengkap." }
  }

  const session = await db.consultationSession.findUnique({ where: { id: sessionId } })

  if (!session) return { ok: false, error: "Sesi tidak ditemukan." }
  if (session.pharmacistId !== user.id) return { ok: false, error: "Kamu tidak punya akses ke sesi ini." }
  if (session.status === "CANCELED") return { ok: false, error: "Sesi sudah selesai." }

  const body = JSON.stringify({
    title,
    description,
    status,
  })

  const event: ConsultationRealtimeEvent = {
    type: "refresh",
    sessionId,
    userIds: [session.patientId, session.pharmacistId],
  }

  await db.$transaction(async (tx: any) => {
    await tx.consultationSummary.upsert({
      where: { sessionId },
      create: {
        sessionId,
        mainProblem: title,
        education: description,
        warning: "",
        followUpAdvice: "",
        finalStatus: status,
        createdBy: user.id,
      },
      update: {
        mainProblem: title,
        education: description,
        warning: "",
        followUpAdvice: "",
        finalStatus: status,
      },
    })

    await tx.consultationMessage.deleteMany({
      where: { sessionId, type: "SUMMARY" },
    })

    await tx.consultationMessage.create({
      data: {
        sessionId,
        senderId: user.id,
        type: "SUMMARY",
        body,
      },
    })

    await tx.consultationSession.update({
      where: { id: sessionId },
      data: {
        status,
        endedAt: new Date(),
        patientUnreadCount: { increment: 1 },
        pharmacistUnreadCount: 0,
      },
    })

    const payload = JSON.stringify(event)
    await tx.$executeRaw`SELECT pg_notify('consultation_message', ${payload})`
  })

  publishConsultationEvent(event)
  return { ok: true }
}
