import { DashboardPromoCarousel } from "@/components/dashboard-promo-carousel"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import {
  CheckCircle2Icon,
  Clock3Icon,
  InboxIcon,
  MessagesSquareIcon,
} from "lucide-react"

const activeStatuses = ["ACTIVE", "WAITING_USER", "WAITING_PHARMACIST"] as const

const insightCards = [
  {
    title: "Konsultasi Aktif",
    key: "active",
    description: "Sesi yang masih berjalan",
    icon: MessagesSquareIcon,
  },
  {
    title: "Menunggu Respons",
    key: "waiting",
    description: "Pasien menunggu balasan",
    icon: Clock3Icon,
  },
  {
    title: "Belum Dibaca",
    key: "unread",
    description: "Pesan masuk untuk dicek",
    icon: InboxIcon,
  },
  {
    title: "Selesai Bulan Ini",
    key: "completed",
    description: "Konsultasi sudah diringkas",
    icon: CheckCircle2Icon,
  },
] as const

export default async function PharmacistDashboardPage() {
  const user = await requireRole("PHARMACIST")
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [activeCount, waitingCount, unreadResult, completedThisMonth] =
    await Promise.all([
      db.consultationSession.count({
        where: { pharmacistId: user.id, status: { in: [...activeStatuses] } },
      }),
      db.consultationSession.count({
        where: { pharmacistId: user.id, status: "WAITING_PHARMACIST" },
      }),
      db.consultationSession.aggregate({
        where: { pharmacistId: user.id },
        _sum: { pharmacistUnreadCount: true },
      }),
      db.consultationSession.count({
        where: {
          pharmacistId: user.id,
          status: { in: ["COMPLETED", "REFERRED"] },
          endedAt: { gte: monthStart },
        },
      }),
    ])

  const insightValues = {
    active: activeCount,
    waiting: waitingCount,
    unread: unreadResult._sum.pharmacistUnreadCount ?? 0,
    completed: completedThisMonth,
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <DashboardPromoCarousel />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-lg font-semibold">Insight Konsultasi</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan singkat aktivitas konsultasi kamu.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {insightCards.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.key} size="sm">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardDescription>{item.title}</CardDescription>
                    <CardTitle className="text-2xl">
                      {insightValues[item.key]}
                    </CardTitle>
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </main>
  )
}
