"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  HeartPulseIcon,
  FileTextIcon,
  HomeIcon,
  LogOutIcon,
  MessageCircleIcon,
  PillIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react"

import { logout } from "@/app/actions/auth/logout"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const patientNavItems: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: HomeIcon, exact: true },
  { href: "/dashboard/obat", label: "Obat", icon: PillIcon },
  { href: "/dashboard/pharmacists", label: "Apoteker", icon: SearchIcon },
  { href: "/dashboard/chat", label: "Chat", icon: MessageCircleIcon },
  { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
]

const pharmacistNavItems: NavItem[] = [
  { href: "/pharmacist/dashboard", label: "Beranda", icon: HomeIcon, exact: true },
  { href: "/pharmacist/dashboard/obat", label: "Obat", icon: PillIcon },
  { href: "/pharmacist/dashboard/tulis-obat", label: "Tulis Obat", icon: FileTextIcon },
  { href: "/pharmacist/dashboard/chat", label: "Chat", icon: MessageCircleIcon },
  { href: "/pharmacist/dashboard/profile", label: "Profil", icon: UserIcon },
]

function pageTitle(pathname: string, navItems: NavItem[]) {
  return navItems.find((item) => isActivePath(pathname, item))?.label ?? "Dashboard"
}

function isActivePath(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function DashboardSidebar({
  pathname,
  user,
  unreadCount,
  navItems,
  chatHref,
  subtitle,
}: {
  pathname: string
  user: { name: string; email: string }
  unreadCount: number
  navItems: NavItem[]
  chatHref: string
  subtitle: string
}) {
  const { state } = useSidebar()
  const expanded = state === "expanded"

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 rounded-md bg-sidebar-accent px-2 py-2 text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs group-data-[collapsible=icon]:size-8">
            <HeartPulseIcon className="size-4" />
          </div>
          {expanded ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Medisigna</p>
              <p className="truncate text-xs text-sidebar-foreground/70">{subtitle}</p>
            </div>
          ) : null}
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          {expanded ? <SidebarGroupLabel>Menu</SidebarGroupLabel> : null}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActivePath(pathname, item)}
                    size="lg"
                    tooltip={item.label}
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  >
                    <Link href={item.href} className="relative">
                      <item.icon />
                      {expanded ? <span>{item.label}</span> : null}
                      {item.href === chatHref && unreadCount > 0 ? (
                        <span
                          className={cn(
                            "flex min-w-5 items-center justify-center rounded-full bg-primary-foreground px-1.5 text-[10px] font-bold text-primary",
                            expanded
                              ? "ml-auto"
                              : "absolute -top-1 -right-1 bg-primary text-primary-foreground"
                          )}
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {expanded ? (
          <div className="min-w-0 rounded-md bg-sidebar-accent px-3 py-2 text-xs">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-sidebar-foreground/70">{user.email}</p>
          </div>
        ) : null}
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-start group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <LogOutIcon data-icon="inline-start" />
            {expanded ? <span>Keluar</span> : null}
          </Button>
        </form>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function DashboardShell({
  children,
  user,
  initialUnreadCount,
  navItems,
  chatHref,
  subtitle,
}: {
  children: React.ReactNode
  user: { name: string; email: string }
  initialUnreadCount: number
  navItems: NavItem[]
  chatHref: string
  subtitle: string
}) {
  const pathname = usePathname()
  const title = pageTitle(pathname, navItems)
  const isChatRoom = pathname.startsWith(`${chatHref}/`)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)

  const fetchUnreadCount = useCallback(async () => {
    const response = await fetch("/api/consultation/unread", { cache: "no-store" })
    if (!response.ok) return
    const data = await response.json()
    setUnreadCount(data.unreadCount)
  }, [])

  useEffect(() => {
    const events = new EventSource("/api/consultation/events")
    events.onmessage = fetchUnreadCount
    return () => events.close()
  }, [fetchUnreadCount])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar
          pathname={pathname}
          user={user}
          unreadCount={unreadCount}
          navItems={navItems}
          chatHref={chatHref}
          subtitle={subtitle}
        />
        <SidebarInset className={cn(!isChatRoom && "pb-24 md:pb-0")}>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="hidden md:inline-flex" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="truncate text-xs text-muted-foreground md:hidden">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden min-w-0 text-right text-xs md:block">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-muted-foreground">{user.email}</p>
              </div>
              <ThemeToggle />
              <form action={logout} className="md:hidden">
                <Button type="submit" variant="ghost" size="icon-sm" aria-label="Keluar">
                  <LogOutIcon />
                </Button>
              </form>
            </div>
          </header>
          <div className="min-w-0 flex-1 overflow-x-clip">{children}</div>
          {!isChatRoom ? (
            <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-20 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-xl border border-border/60 bg-background/65 p-2 shadow-lg shadow-foreground/10 backdrop-blur-xl md:hidden">
              <div
                className={cn(
                  "grid gap-1",
                  navItems.length === 2
                    ? "grid-cols-2"
                    : navItems.length === 6
                      ? "grid-cols-3"
                    : navItems.length === 5
                      ? "grid-cols-5"
                      : "grid-cols-4"
                )}
              >
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-muted-foreground",
                        active && "bg-primary text-primary-foreground"
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                      {item.href === chatHref && unreadCount > 0 ? (
                        <span className="absolute top-1.5 right-4 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                    </Link>
                  )
                })}
              </div>
            </nav>
          ) : null}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export function UserDashboardShell(
  props: Omit<
    React.ComponentProps<typeof DashboardShell>,
    "navItems" | "chatHref" | "subtitle"
  >
) {
  return (
    <DashboardShell
      {...props}
      navItems={patientNavItems}
      chatHref="/dashboard/chat"
      subtitle="Konseling obat"
    />
  )
}

export function PharmacistDashboardShell(
  props: Omit<
    React.ComponentProps<typeof DashboardShell>,
    "navItems" | "chatHref" | "subtitle"
  >
) {
  return (
    <DashboardShell
      {...props}
      navItems={pharmacistNavItems}
      chatHref="/pharmacist/dashboard/chat"
      subtitle="Konseling pasien"
    />
  )
}
