import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { requireRole } from "@/lib/session"

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await requireRole("ADMIN")

  return (
    <AdminDashboardShell user={{ name: user.name, email: user.email }}>
      {children}
    </AdminDashboardShell>
  )
}
