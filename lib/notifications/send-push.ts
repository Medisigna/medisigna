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
      return { ok: true, notification, pushSentCount: 0 }
    }

    const messaging = getAdminMessaging()
    if (!messaging) {
      return { ok: true, notification, pushSentCount: 0 }
    }

    const tokens: string[] = fcmTokens.map((t: { id: string; token: string }) => t.token)

    // 3. Send Multicast Push Notification via Firebase Admin
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
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
    })

    // 4. Prune invalid or unregistered tokens
    const tokensToDelete: string[] = []
    response.responses.forEach((resp: SendResponse, idx: number) => {
      if (!resp.success) {
        const error = resp.error
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
