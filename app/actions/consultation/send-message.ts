"use server"

import { db } from "@/lib/db"
import { saveConsultationImage } from "@/lib/consultation-upload"
import {
  type ConsultationRealtimeEvent,
  publishConsultationEvent,
} from "@/lib/consultation-realtime"
import { requireUser } from "@/lib/session"

const finalStatuses = ["COMPLETED", "REFERRED", "CANCELED"]
const imageTypes = ["image/jpeg", "image/png", "image/webp"]
const maxImageBytes = 4 * 1024 * 1024

export async function sendConsultationMessage(formData: FormData) {
  try {
    const user = await requireUser()
    const sessionId = String(formData.get("sessionId") ?? "")
    const body = String(formData.get("body") ?? "").trim()
    const image = formData.get("image")
    const hasImage = image instanceof File && image.size > 0

    if (!body && !hasImage)
      return { ok: false, error: "Pesan tidak boleh kosong." }
    if (hasImage && !imageTypes.includes(image.type))
      return { ok: false, error: "File harus berupa gambar." }
    if (hasImage && image.size > maxImageBytes)
      return { ok: false, error: "Ukuran gambar maksimal 4 MB." }

    const session = await db.consultationSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) return { ok: false, error: "Sesi tidak ditemukan." }
    if (session.patientId !== user.id && session.pharmacistId !== user.id) {
      return { ok: false, error: "Kamu tidak punya akses ke sesi ini." }
    }
    if (finalStatuses.includes(session.status))
      return { ok: false, error: "Sesi sudah selesai." }

    let attachment = null

    try {
      attachment = hasImage ? await saveConsultationImage(image) : null
    } catch (error) {
      console.error("Consultation image upload failed", error)
      return { ok: false, error: "Foto gagal diunggah. Coba lagi." }
    }

    const event: ConsultationRealtimeEvent = {
      type: "refresh",
      sessionId,
      userIds: [session.patientId, session.pharmacistId],
    }

    await db.$transaction(async (tx: any) => {
      await tx.consultationMessage.create({
        data: {
          sessionId,
          senderId: user.id,
          type: attachment ? "IMAGE" : "TEXT",
          body: body || null,
          ...(attachment ? { attachments: { create: attachment } } : {}),
        },
      })

      await tx.consultationSession.update({
        where: { id: sessionId },
        data: {
          status:
            session.patientId === user.id ? "WAITING_PHARMACIST" : "WAITING_USER",
          ...(session.patientId === user.id
            ? {
                patientUnreadCount: 0,
                pharmacistUnreadCount: { increment: 1 },
              }
            : {
                patientUnreadCount: { increment: 1 },
                pharmacistUnreadCount: 0,
              }),
        },
      })

      try {
        const payload = JSON.stringify(event)
        await tx.$executeRaw`SELECT pg_notify('consultation_message', ${payload})`
      } catch (notifyErr) {
        console.warn("pg_notify notification failed:", notifyErr)
      }
    })

    try {
      publishConsultationEvent(event)
    } catch (pubErr) {
      console.warn("publishConsultationEvent failed:", pubErr)
    }

    const recipientId = session.patientId === user.id ? session.pharmacistId : session.patientId
    const link = session.patientId === user.id ? `/pharmacist/dashboard/chat/${sessionId}` : `/dashboard/chat/${sessionId}`
    const previewBody = body || (attachment ? "[Foto]" : "Mengirim pesan baru")

    if (recipientId) {
      try {
        const { sendNotificationToUser } = await import("@/lib/notifications/send-push")
        await sendNotificationToUser({
          recipientId,
          title: `Pesan Baru: ${user.name}`,
          body: previewBody,
          link,
          type: "CONSULTATION_CHAT",
        })
      } catch (pushErr) {
        console.warn("Push notification dispatch failed:", pushErr)
      }
    }


    return { ok: true }
  } catch (error) {
    console.error("Error in sendConsultationMessage:", error)
    return { ok: false, error: "Gagal mengirim pesan. Silakan coba lagi." }
  }
}
