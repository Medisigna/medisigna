import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

const excludedHeaderTypes = ["CONSULTATION_CHAT", "CONSULTATION_START"]

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  try {
    const notifications = await db.notification.findMany({
      where: {
        userId: user.id,
        type: { notIn: excludedHeaderTypes },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const unreadCount = await db.notification.count({
      where: {
        userId: user.id,
        isRead: false,
        type: { notIn: excludedHeaderTypes },
      },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Gagal mengambil notifikasi." }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { notificationId, markAll } = body

    if (markAll) {
      await db.notification.updateMany({
        where: {
          userId: user.id,
          isRead: false,
          type: { notIn: excludedHeaderTypes },
        },
        data: { isRead: true },
      })
      return NextResponse.json({ ok: true })
    }

    if (notificationId) {
      await db.notification.updateMany({
        where: { id: notificationId, userId: user.id },
        data: { isRead: true },
      })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 })
  } catch (error) {
    console.error("Error updating notification status:", error)
    return NextResponse.json({ error: "Gagal mengbarui notifikasi." }, { status: 500 })
  }
}
