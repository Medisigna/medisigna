import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { token, deviceType = "web" } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token FCM tidak valid." }, { status: 400 })
    }

    const fcmToken = await db.fcmToken.upsert({
      where: { token },
      update: {
        userId: user.id,
        deviceType,
      },
      create: {
        userId: user.id,
        token,
        deviceType,
      },
    })

    return NextResponse.json({ ok: true, fcmToken })
  } catch (error) {
    console.error("Error saving FCM token:", error)
    return NextResponse.json({ error: "Gagal menyimpan token FCM." }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tidak terautentikasi." }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { token } = body

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token FCM tidak valid." }, { status: 400 })
    }

    await db.fcmToken.deleteMany({
      where: {
        token,
        userId: user.id,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting FCM token:", error)
    return NextResponse.json({ error: "Gagal menghapus token FCM." }, { status: 500 })
  }
}
