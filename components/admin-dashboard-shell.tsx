"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { HeartPulseIcon, LogOutIcon, PillIcon, UserCheckIcon } from "lucide-react"

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

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Verifikasi Apoteker", icon: UserCheckIcon, exact: true },
  { href: "/admin/obat", label: "Informasi Obat", icon: PillIcon },
]

function isActivePath(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function pageTitle(pathname: string) {
  return adminNavItems.find((item) => isActivePath(pathname, item))?.label ?? "Admin"
}

function AdminSidebar({
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
              <p className="truncate text-xs text-sidebar-foreground/70">Admin</p>
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
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActivePath(pathname, item)}
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

export function AdminDashboardShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: { name: string; email: string }
}) {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar pathname={pathname} user={user} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{pageTitle(pathname)}</p>
                <p className="truncate text-xs text-muted-foreground md:hidden">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden min-w-0 text-right text-xs md:block">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-muted-foreground">{user.email}</p>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <div className="min-w-0 flex-1 overflow-x-clip">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
