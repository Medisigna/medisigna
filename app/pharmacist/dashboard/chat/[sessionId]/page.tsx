import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { ChatRoom } from "@/components/consultation/chat-room"
import { SessionList } from "@/components/consultation/session-list"
import { SummaryForm } from "@/components/consultation/summary-form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ sessionId: string }>
}

function toSessionListItem(session: any) {
  return {
    id: session.id,
    name: session.patient.name,
    status: session.status,
    lastMessage:
      session.messages[0]?.type === "SUMMARY"
        ? "Ringkasan konseling"
        : session.messages[0]?.body ??
          (session.messages[0]?.type === "IMAGE" ? "Gambar" : "Belum ada pesan."),
    updatedAt: session.updatedAt.toISOString(),
    unreadCount: session.pharmacistUnreadCount,
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default async function PharmacistChatSessionPage({ params }: PageProps) {
  const user = await requireRole("PHARMACIST")
  const { sessionId } = await params
  const [session, sessions] = await Promise.all([
    db.consultationSession.findUnique({
      where: { id: sessionId },
      include: {
        patient: { include: { patientProfile: true } },
        messages: { include: { attachments: true }, orderBy: { createdAt: "asc" } },
        summary: true,
      },
    }),
    db.consultationSession.findMany({
      where: { pharmacistId: user.id },
      include: {
        patient: { include: { patientProfile: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  if (!session || session.pharmacistId !== user.id) notFound()

  return (
    <main className="mx-auto grid h-[calc(100svh-3.5rem)] max-w-6xl overflow-hidden lg:min-h-0 lg:grid-cols-[340px_1fr] lg:gap-4 lg:px-6 lg:py-8">
      <AppMessage />
      <section className="hidden min-h-0 flex-col gap-4 rounded-2xl border bg-card p-6 lg:flex">
        <h1 className="text-xl font-semibold">Riwayat Chat</h1>
        <SessionList
          filterable
          basePath="/pharmacist/dashboard/chat"
          activeSessionId={session.id}
          sessions={sessions.map(toSessionListItem)}
        />
      </section>

      <section className="flex min-h-0 flex-col lg:gap-4">
        <section className="flex shrink-0 items-center gap-3 border-b bg-card px-3 py-2.5 lg:rounded-lg lg:border">
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Kembali ke riwayat"
            className="lg:hidden"
          >
            <Link href="/pharmacist/dashboard/chat">
              <ArrowLeftIcon />
            </Link>
          </Button>
          <Avatar size="lg">
            <AvatarFallback>{initials(session.patient.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{session.patient.name}</h1>
            <p className="truncate text-xs text-muted-foreground">{session.status}</p>
          </div>
          <SummaryForm
            sessionId={session.id}
            summary={session.summary}
            disabled={session.status === "CANCELED"}
          />
        </section>

        <ChatRoom
          className="min-h-0 flex-1 rounded-none border-x-0 border-b-0 lg:min-h-[calc(100svh-10rem)] lg:rounded-lg lg:border"
          sessionId={session.id}
          currentUserId={user.id}
          currentUserRole="PHARMACIST"
          counterpartName={session.patient.name}
          sessionStatus={session.status}
          initialMessages={session.messages.map((message: any) => ({
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
          }))}
        />
      </section>
    </main>
  )
}
