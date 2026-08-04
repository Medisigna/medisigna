import { SessionList } from "@/components/consultation/session-list"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

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

export default async function PharmacistChatPage() {
  const user = await requireRole("PHARMACIST")
  const sessions = await db.consultationSession.findMany({
    where: { pharmacistId: user.id },
    include: {
      patient: { include: { patientProfile: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      summary: true,
    },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <main className="mx-auto grid h-[calc(100svh-9.5rem)] w-full min-w-0 max-w-6xl overflow-hidden gap-4 py-4 md:h-[calc(100svh-3.5rem)] md:py-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="flex min-h-0 min-w-0 flex-col gap-4 rounded-[1.75rem] bg-card p-3 sm:p-4 lg:p-6">
        <h1 className="text-xl font-semibold">Riwayat Chat</h1>
        <SessionList
          filterable
          variant="soft"
          basePath="/pharmacist/dashboard/chat"
          sessions={sessions.map(toSessionListItem)}
        />
      </section>

      <section className="hidden min-h-0 items-center justify-center rounded-[1.75rem] bg-card p-6 text-center text-sm text-muted-foreground lg:flex">
        Pilih chat untuk membuka percakapan.
      </section>
    </main>
  )
}
