import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { requireRole } from "@/lib/session"

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireRole("PATIENT")

  return (
    <UserDashboardShell user={{ name: user.name, email: user.email }}>
      {children}
    </UserDashboardShell>
  )
}
