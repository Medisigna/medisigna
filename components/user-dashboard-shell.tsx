"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HeartPulseIcon,
  HomeIcon,
  LogOutIcon,
  MessageCircleIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react"

import { logout } from "@/app/actions/auth/logout"
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

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: HomeIcon },
  { href: "/dashboard/pharmacists", label: "Apoteker", icon: SearchIcon },
  { href: "/dashboard/chat", label: "Chat", icon: MessageCircleIcon },
  { href: "/dashboard/profile", label: "Profil", icon: UserIcon },
]

function pageTitle(pathname: string) {
  return navItems.find((item) => isActivePath(pathname, item.href))?.label ?? "Dashboard"
}

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

function DashboardSidebar({
  pathname,
  user,
}: {
  pathname: string
  user: { name: string; email: string }
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
              <p className="truncate text-xs text-sidebar-foreground/70">Konseling obat</p>
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
                    isActive={isActivePath(pathname, item.href)}
                    size="lg"
                    tooltip={item.label}
                    className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  >
                    <Link href={item.href}>
                      <item.icon />
                      {expanded ? <span>{item.label}</span> : null}
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

export function UserDashboardShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name: string; email: string }
}) {
  const pathname = usePathname()
  const title = pageTitle(pathname)

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar pathname={pathname} user={user} />
        <SidebarInset className="pb-24 md:pb-0">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="hidden md:inline-flex" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title}</p>
                <p className="truncate text-xs text-muted-foreground md:hidden">{user.name}</p>
              </div>
            </div>
            <div className="hidden min-w-0 text-right text-xs md:block">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-muted-foreground">{user.email}</p>
            </div>
            <form action={logout} className="md:hidden">
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Keluar">
                <LogOutIcon />
              </Button>
            </form>
          </header>
          <div className="flex-1">{children}</div>
          <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-20 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-xl border border-border/60 bg-background/65 p-2 shadow-lg shadow-foreground/10 backdrop-blur-xl md:hidden">
            <div className="grid grid-cols-4 gap-1">
              {navItems.map((item) => {
                const active = isActivePath(pathname, item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-muted-foreground",
                      active && "bg-primary text-primary-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
