"use client"

import {
  FileTextIcon,
  HomeIcon,
  MessageCircleIcon,
  MessagesSquareIcon,
  NewspaperIcon,
  PillIcon,
  SearchIcon,
  UserIcon,
  VideoIcon,
} from "lucide-react"

import {
  DashboardShell,
  type DashboardNavItem,
} from "@/components/dashboard-shell"

const patientNavItems: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Beranda",
    description: "Ringkasan konseling obat",
    icon: HomeIcon,
    iconSrc: "/menu-icons/home.png",
    exact: true,
  },
  {
    href: "/dashboard/obat",
    label: "Obat A-Z",
    description: "Cari informasi obat",
    icon: PillIcon,
    iconSrc: "/menu-icons/medicines.png",
  },
  {
    href: "/dashboard/pharmacists",
    label: "Apoteker",
    description: "Pilih apoteker konsultasi",
    icon: SearchIcon,
    hideOnMobileNav: true,
  },
  {
    href: "/dashboard/chat",
    label: "Konsultasi",
    description: "Percakapan aktif",
    icon: MessageCircleIcon,
    iconSrc: "/menu-icons/consult.png",
  },
  {
    href: "/dashboard/forum",
    label: "Forum",
    description: "Diskusi kesehatan",
    icon: MessagesSquareIcon,
    iconSrc: "/menu-icons/Forum.png",
  },
  {
    href: "/dashboard/artikel",
    label: "Artikel",
    description: "Bacaan kesehatan",
    icon: NewspaperIcon,
    iconSrc: "/menu-icons/article.png",
    children: [
      {
        href: "/dashboard/video",
        label: "Video Kesehatan",
        description: "Video edukasi",
        icon: VideoIcon,
        iconSrc: "/menu-icons/education.png",
      },
      {
        href: "/dashboard/artikel",
        label: "Artikel",
        description: "Bacaan kesehatan",
        icon: NewspaperIcon,
        iconSrc: "/menu-icons/article.png",
      },
    ],
  },
  {
    href: "/dashboard/profile",
    label: "Profil",
    description: "Data akun pasien",
    icon: UserIcon,
    hideOnMobileNav: true,
  },
]

const pharmacistNavItems: DashboardNavItem[] = [
  {
    href: "/pharmacist/dashboard",
    label: "Beranda",
    description: "Ringkasan konsultasi",
    icon: HomeIcon,
    iconSrc: "/menu-icons/home.png",
    exact: true,
  },
  {
    href: "/pharmacist/dashboard/obat",
    label: "Obat",
    description: "Kelola informasi obat",
    icon: PillIcon,
    iconSrc: "/menu-icons/medicines.png",
  },
  {
    href: "/pharmacist/dashboard/chat",
    label: "Chat",
    description: "Konseling pasien",
    icon: MessageCircleIcon,
    iconSrc: "/menu-icons/consult.png",
  },
  {
    href: "/pharmacist/dashboard/forum",
    label: "Forum",
    description: "Diskusi apoteker",
    icon: MessagesSquareIcon,
    iconSrc: "/menu-icons/Forum.png",
  },
  {
    href: "/pharmacist/dashboard/konten",
    label: "Konten",
    description: "Tulis obat, artikel, video",
    icon: FileTextIcon,
    iconSrc: "/menu-icons/article.png",
    children: [
      {
        href: "/pharmacist/dashboard/tulis-obat",
        label: "Tulis Obat",
        description: "Tambah informasi obat",
        icon: PillIcon,
        iconSrc: "/menu-icons/medicines.png",
      },
      {
        href: "/pharmacist/dashboard/tulis-artikel",
        label: "Tulis Artikel",
        description: "Tambah artikel edukasi",
        icon: NewspaperIcon,
        iconSrc: "/menu-icons/article.png",
      },
      {
        href: "/pharmacist/dashboard/tulis-video",
        label: "Tulis Video",
        description: "Tambah video edukasi",
        icon: VideoIcon,
        iconSrc: "/menu-icons/education.png",
      },
    ],
  },
  {
    href: "/pharmacist/dashboard/profile",
    label: "Profil",
    description: "Data apoteker",
    icon: UserIcon,
    hideOnMobileNav: true,
  },
]

type UserShellProps = Omit<
  React.ComponentProps<typeof DashboardShell>,
  "navItems" | "chatHref" | "subtitle"
>

export function UserDashboardShell(props: UserShellProps) {
  return (
    <DashboardShell
      {...props}
      navItems={patientNavItems}
      chatHref="/dashboard/chat"
      profileHref="/dashboard/profile"
      subtitle="Konseling obat"
      mobileNavigation="bottom"
    />
  )
}

export function PharmacistDashboardShell(props: UserShellProps) {
  return (
    <DashboardShell
      {...props}
      navItems={pharmacistNavItems}
      chatHref="/pharmacist/dashboard/chat"
      profileHref="/pharmacist/dashboard/profile"
      subtitle="Konseling pasien"
      mobileNavigation="bottom"
    />
  )
}
