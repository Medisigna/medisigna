"use client"

import { NewspaperIcon, PillIcon, UserCheckIcon } from "lucide-react"

import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard-shell"

const adminNavItems: DashboardNavItem[] = [
  {
    href: "/admin",
    label: "Verifikasi Apoteker",
    description: "Review akun apoteker",
    icon: UserCheckIcon,
    exact: true,
  },
  {
    href: "/admin/obat",
    label: "Informasi Obat",
    description: "Moderasi konten obat",
    icon: PillIcon,
  },
  {
    href: "/admin/artikel",
    label: "Artikel",
    description: "Moderasi artikel",
    icon: NewspaperIcon,
  },
]

export function AdminDashboardShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name: string; email: string }
}) {
  return (
    <DashboardShell user={user} navItems={adminNavItems} subtitle="Admin">
      {children}
    </DashboardShell>
  )
}
