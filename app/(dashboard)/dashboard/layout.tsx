import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireRole("PATIENT")
  const unread = await db.consultationSession.aggregate({
    where: { patientId: user.id },
    _sum: { patientUnreadCount: true },
  })

  return (
    <UserDashboardShell
      user={{ name: user.name, email: user.email }}
      initialUnreadCount={unread._sum.patientUnreadCount ?? 0}
    >
      {children}
    </UserDashboardShell>
  )
}
