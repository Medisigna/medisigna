import { PharmacistDashboardShell } from "@/components/user-dashboard-shell"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

export default async function PharmacistDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireRole("PHARMACIST")
  const unread = await db.consultationSession.aggregate({
    where: { pharmacistId: user.id },
    _sum: { pharmacistUnreadCount: true },
  })

  return (
    <PharmacistDashboardShell
      user={{ name: user.name, email: user.email }}
      initialUnreadCount={unread._sum.pharmacistUnreadCount ?? 0}
    >
      {children}
    </PharmacistDashboardShell>
  )
}
