"use server"

import { redirect } from "next/navigation"

import {
  type ConsultationRealtimeEvent,
  publishConsultationEvent,
} from "@/lib/consultation-realtime"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail } from "../shared"

export async function startConsultationSession(pharmacistProfileId: string) {
  const user = await requireRole("PATIENT")
  const path = `/dashboard/pharmacists/${pharmacistProfileId}`
  const profile = await db.pharmacistProfile.findFirst({
    where: {
      id: pharmacistProfileId,
      verificationStatus: "VERIFIED",
      user: {
        role: "PHARMACIST",
        status: "ACTIVE",
      },
    },
    include: { user: true },
  })

  if (!profile) fail("/dashboard/pharmacists", "Apoteker tidak ditemukan.")
  const result = await db.$transaction(async (tx: any) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${user.id}:${profile.userId}`}, 0))`

    const existing = await tx.consultationSession.findFirst({
      where: {
        patientId: user.id,
        pharmacistId: profile.userId,
        status: { in: ["ACTIVE", "WAITING_USER", "WAITING_PHARMACIST"] },
      },
      orderBy: { createdAt: "desc" },
    })

    if (existing) return { session: existing, created: false }
    if (profile.availabilityStatus !== "ONLINE") fail(path, "Apoteker sedang offline.")

    const created = await tx.consultationSession.create({
      data: {
        patientId: user.id,
        pharmacistId: profile.userId,
        status: "ACTIVE",
        pharmacistUnreadCount: 1,
      },
    })

    await tx.consultationMessage.create({
      data: {
        sessionId: created.id,
        senderId: profile.userId,
        type: "SYSTEM",
        body: "Sesi konseling dimulai.",
      },
    })

    const event: ConsultationRealtimeEvent = {
      type: "refresh",
      sessionId: created.id,
      userIds: [created.patientId, created.pharmacistId],
    }
    const payload = JSON.stringify(event)
    await tx.$executeRaw`SELECT pg_notify('consultation_message', ${payload})`

    return { session: created, created: true }
  })

  if (result.created) {
    publishConsultationEvent({
      type: "refresh",
      sessionId: result.session.id,
      userIds: [result.session.patientId, result.session.pharmacistId],
    })

    try {
      const { sendNotificationToUser } = await import("@/lib/notifications/send-push")
      await sendNotificationToUser({
        recipientId: profile.userId,
        title: "Konsultasi Baru",
        body: `Pasien ${user.name} telah memulai sesi konseling baru.`,
        link: `/pharmacist/dashboard/chat/${result.session.id}`,
        type: "CONSULTATION_START",
      })
    } catch (pushErr) {
      console.warn("Push notification dispatch failed on start-session:", pushErr)
    }
  }
  redirect(`/dashboard/chat/${result.session.id}`)
}
