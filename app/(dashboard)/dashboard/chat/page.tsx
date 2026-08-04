import { SessionList } from "@/components/consultation/session-list"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

function toSessionListItem(session: any) {
  return {
    id: session.id,
    name: session.pharmacist.name,
    status: session.status,
    lastMessage:
      session.messages[0]?.type === "SUMMARY"
        ? "Ringkasan konseling"
        : (session.messages[0]?.body ??
          (session.messages[0]?.type === "IMAGE"
            ? "Gambar"
            : "Belum ada pesan.")),
    updatedAt: session.updatedAt.toISOString(),
    unreadCount: session.patientUnreadCount,
  }
}

export default async function ChatPage() {
  const user = await requireRole("PATIENT")
  const sessions = await db.consultationSession.findMany({
    where: { patientId: user.id },
    include: {
      pharmacist: { include: { pharmacistProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      summary: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <main className="min-h-[calc(100dvh-7rem)] rounded-[2rem] bg-secondary py-4 md:rounded-[2.25rem] md:py-6">
      <div className="mx-auto grid h-[calc(100svh-9.5rem)] w-full max-w-6xl min-w-0 gap-4 overflow-hidden md:h-[calc(100svh-3.5rem)] lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="flex min-h-0 min-w-0 flex-col gap-4 rounded-[1.75rem] border-0 bg-card p-3 shadow-none ring-0 sm:p-4 lg:p-6">
          <div>
            <h1 className="text-xl font-semibold">Riwayat Chat</h1>
          </div>
          <SessionList
            filterable
            sessions={sessions.map(toSessionListItem)}
            variant="soft"
          />
        </section>

        <section className="hidden min-h-0 items-center justify-center rounded-[1.75rem] border-0 bg-card p-6 text-center text-sm text-muted-foreground shadow-none ring-0 lg:flex">
          Pilih chat untuk membuka percakapan.
        </section>
      </div>
    </main>
  )
}
