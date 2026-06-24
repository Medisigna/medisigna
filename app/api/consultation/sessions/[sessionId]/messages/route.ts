import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser()
  const { sessionId } = await params

  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 401 })
  }

  const session = await db.consultationSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        include: { attachments: true },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!session || (session.patientId !== user.id && session.pharmacistId !== user.id)) {
    return NextResponse.json({ error: "Kamu tidak punya akses ke sesi ini." }, { status: 404 })
  }

  return NextResponse.json({
    session: {
      id: session.id,
      status: session.status,
    },
    messages: session.messages.map((message: any) => ({
      id: message.id,
      senderId: message.senderId,
      type: message.type,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      attachments: message.attachments.map((attachment: any) => ({
        id: attachment.id,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        fileName: attachment.fileName,
      })),
    })),
  })
}
