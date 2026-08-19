import type { SendResponse } from "firebase-admin/messaging"

import { db } from "@/lib/db"
import { getAdminMessaging } from "@/lib/firebase/admin"

type SendNotificationOptions = {
  recipientId: string
  title: string
  body: string
  link?: string
  type?: string
}

export async function sendNotificationToUser({
  recipientId,
  title,
  body,
  link = "/dashboard/chat",
  type = "CONSULTATION_CHAT",
}: SendNotificationOptions) {
  if (!recipientId) {
    console.warn("[Push Server] Recipient ID kosong (null/undefined). Skip pengiriman notifikasi.")
    return { ok: false, error: "Recipient ID kosong" }
  }

  try {
    // 1. Create in-app Notification record in Database
    const notification = await db.notification.create({
      data: {
        userId: recipientId,
        title,
        body,
        link,
        type,
        isRead: false,
      },
    })

    // 2. Retrieve user's FCM tokens
    const fcmTokens = await db.fcmToken.findMany({
      where: { userId: recipientId },
      select: { id: true, token: true },
    })

    if (fcmTokens.length === 0) {
      console.log(`[Push Server] Recipient (${recipientId}) tidak memiliki FCM Token terdaftar di database. Skip pengiriman push.`)
      return { ok: true, notification, pushSentCount: 0 }
    }

    const messaging = getAdminMessaging()
    if (!messaging) {
      console.warn(`[Push Server] Inisialisasi Firebase Admin Messaging gagal/belum lengkap. Skip pengiriman push ke FCM server.`)
      return { ok: true, notification, pushSentCount: 0 }
    }

    const tokens: string[] = fcmTokens.map((t: { id: string; token: string }) => t.token)

    // 3. Send Push Notifications via modern Firebase Admin messaging.sendEach API
    const messages = tokens.map((token: string) => ({
      token,
      data: {
        title,
        body,
        link,
      },
      webpush: {
        fcmOptions: {
          link,
        },
      },
    }))

    const response = await messaging.sendEach(messages)

    console.log(`[Push Server] Hasil FCM Push ke ${tokens.length} token: ${response.successCount} berhasil, ${response.failureCount} gagal.`)

    // 4. Prune invalid or unregistered tokens
    const tokensToDelete: string[] = []
    response.responses.forEach((resp: SendResponse, idx: number) => {
      if (!resp.success) {
        const error = resp.error
        console.warn(`[Push Server] Token idx ${idx} gagal: ${error?.code} - ${error?.message}`)
        if (
          error?.code === "messaging/invalid-registration-token" ||
          error?.code === "messaging/registration-token-not-registered"
        ) {
          const invalidToken = tokens[idx]
          if (invalidToken) {
            tokensToDelete.push(invalidToken)
          }
        }
      }
    })

    if (tokensToDelete.length > 0) {
      await db.fcmToken.deleteMany({
        where: {
          token: { in: tokensToDelete },
        },
      })
      console.log(`[Push Server] Menghapus ${tokensToDelete.length} FCM token yang kadaluarsa/invalid dari database.`)
    }

    return {
      ok: true,
      notification,
      pushSentCount: response.successCount,
    }
  } catch (error) {
    console.error("Error sending notification:", error)
    return { ok: false, error: "Gagal mengirim notifikasi." }
  }
}
