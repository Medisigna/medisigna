"use client"

import {
  NewspaperIcon,
  PillIcon,
  MessagesSquareIcon,
  TagsIcon,
  UsersIcon,
  UserCheckIcon,
  VideoIcon,
} from "lucide-react"

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
    href: "/admin/users",
    label: "User Management",
    description: "Kelola akun",
    icon: UsersIcon,
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
  {
    href: "/admin/video",
    label: "Video Edukasi",
    description: "Moderasi video",
    icon: VideoIcon,
  },
  {
    href: "/admin/forum",
    label: "Forum",
    description: "Moderasi diskusi",
    icon: MessagesSquareIcon,
  },
  {
    href: "/admin/kategori",
    label: "Kategori Konten",
    description: "Kelola kategori",
    icon: TagsIcon,
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
