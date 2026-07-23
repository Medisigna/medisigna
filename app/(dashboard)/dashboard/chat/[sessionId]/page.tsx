import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { ChatRoom } from "@/components/consultation/chat-room"
import { SessionList } from "@/components/consultation/session-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ sessionId: string }>
}

function toSessionListItem(session: any) {
  return {
    id: session.id,
    name: session.pharmacist.name,
    status: session.status,
    lastMessage:
      session.messages[0]?.type === "SUMMARY"
        ? "Ringkasan konseling"
        : session.messages[0]?.body ??
          (session.messages[0]?.type === "IMAGE" ? "Gambar" : "Belum ada pesan."),
    updatedAt: session.updatedAt.toISOString(),
    unreadCount: session.patientUnreadCount,
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

export default async function PatientChatSessionPage({ params }: PageProps) {
  const user = await requireRole("PATIENT")
  const { sessionId } = await params
  const [session, sessions] = await Promise.all([
    db.consultationSession.findUnique({
      where: { id: sessionId },
      include: {
        pharmacist: { include: { pharmacistProfile: true } },
        messages: { include: { attachments: true }, orderBy: { createdAt: "asc" } },
      },
    }),
    db.consultationSession.findMany({
      where: { patientId: user.id },
      include: {
        pharmacist: { include: { pharmacistProfile: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ])

  if (!session || session.patientId !== user.id) notFound()

  return (
    <main className="mx-auto grid h-[100dvh] max-w-6xl overflow-hidden lg:h-[calc(100svh-3.5rem)] lg:min-h-0 lg:grid-cols-[340px_1fr] lg:gap-4 lg:px-6 lg:py-8">
      <AppMessage />
      <section className="hidden min-h-0 flex-col gap-4 rounded-2xl border bg-card p-6 lg:flex">
        <div>
          <h1 className="text-xl font-semibold">Riwayat Chat</h1>
        </div>
        <SessionList
          filterable
          activeSessionId={session.id}
          sessions={sessions.map(toSessionListItem)}
        />
      </section>

      <section className="flex min-h-0 flex-col lg:gap-4">
        <section className="flex shrink-0 items-center gap-3 border-b bg-card px-3 py-2.5 lg:hidden">
          <Button asChild variant="ghost" size="icon-sm" aria-label="Kembali ke riwayat">
            <Link href="/dashboard/chat">
              <ArrowLeftIcon />
            </Link>
          </Button>
          <Avatar size="lg">
            <AvatarImage
              src={session.pharmacist.pharmacistProfile?.profilePhotoUrl ?? session.pharmacist.image ?? undefined}
              alt={session.pharmacist.name}
            />
            <AvatarFallback>{initials(session.pharmacist.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{session.pharmacist.name}</h1>
            <p className="truncate text-xs text-muted-foreground">{session.status}</p>
          </div>
        </section>

        <ChatRoom
          className="min-h-0 flex-1 rounded-none border-x-0 border-b-0 lg:min-h-[calc(100svh-10rem)] lg:rounded-lg lg:border"
          sessionId={session.id}
          currentUserId={user.id}
          currentUserRole="PATIENT"
          counterpartName={session.pharmacist.name}
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
