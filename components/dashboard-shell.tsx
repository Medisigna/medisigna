"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  HeartPulseIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from "lucide-react"

import { logout } from "@/app/actions/auth/logout"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

export type DashboardNavItem = {
  href: string
  label: string
  description: string
  icon: LucideIcon
  exact?: boolean
}

type DashboardShellProps = {
  children: React.ReactNode
  user: { name: string; email: string }
  navItems: DashboardNavItem[]
  subtitle: string
  initialUnreadCount?: number
  chatHref?: string
  mobileNavigation?: "drawer" | "bottom"
}

function getUserInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return initials || "U"
}

function isActivePath(pathname: string, item: DashboardNavItem) {
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function pageTitle(pathname: string, navItems: DashboardNavItem[]) {
  return navItems.find((item) => isActivePath(pathname, item))?.label ?? "Dashboard"
}

function ShellBrand({ subtitle }: { subtitle: string }) {
  return (
    <Link
      href="/"
      className="rounded-2xl border border-sidebar-border/70 bg-background/80 px-4 py-4 transition-colors hover:bg-background"
      aria-label="Medisigna"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
          <HeartPulseIcon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-secondary-foreground">
            Medisigna
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {subtitle}
          </div>
        </div>
      </div>
    </Link>
  )
}

function DashboardNavLink({
  item,
  pathname,
  unreadCount,
  chatHref,
  onClick,
  drawer = false,
}: {
  item: DashboardNavItem
  pathname: string
  unreadCount: number
  chatHref?: string
  onClick?: () => void
  drawer?: boolean
}) {
  const Icon = item.icon
  const active = isActivePath(pathname, item)
  const showUnread = item.href === chatHref && unreadCount > 0

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all",
        active
          ? "border-sidebar-border bg-background text-secondary-foreground shadow-[0_16px_34px_-28px_rgba(14,47,89,0.55)]"
          : "border-transparent text-muted-foreground hover:border-border/80 hover:bg-sidebar-accent/80 hover:text-secondary-foreground",
        drawer && "rounded-xl py-2.5"
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-background/85 text-primary"
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {item.label}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {item.description}
        </span>
      </span>
      {showUnread ? (
        <span className="flex min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}

function LogoutForm({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logout}>
      <Button
        type="submit"
        variant={compact ? "ghost" : "outline"}
        size={compact ? "icon-sm" : "default"}
        className={compact ? undefined : "w-full rounded-xl"}
        aria-label={compact ? "Keluar" : undefined}
      >
        <LogOutIcon data-icon="inline-start" />
        {compact ? null : <span>Keluar</span>}
      </Button>
    </form>
  )
}

export function DashboardShell({
  children,
  user,
  navItems,
  subtitle,
  initialUnreadCount = 0,
  chatHref,
  mobileNavigation = "drawer",
}: DashboardShellProps) {
  const pathname = usePathname()
  const title = pageTitle(pathname, navItems)
  const isChatRoom = chatHref ? pathname.startsWith(`${chatHref}/`) : false
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const initials = getUserInitials(user.name)

  const fetchUnreadCount = useCallback(async () => {
    const response = await fetch("/api/consultation/unread", { cache: "no-store" })
    if (!response.ok) return
    const data = await response.json()
    setUnreadCount(data.unreadCount)
  }, [])

  useEffect(() => {
    if (!chatHref) return

    const events = new EventSource("/api/consultation/events")
    events.onmessage = fetchUnreadCount
    return () => events.close()
  }, [chatHref, fetchUnreadCount])

  return (
    <div className="min-h-screen bg-background">
      <div
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-[1540px]",
          isChatRoom
            ? "gap-0 px-0 py-0 lg:gap-4 lg:px-8 lg:py-6"
            : "gap-4 px-4 py-4 sm:px-6 sm:py-6 xl:px-8"
        )}
      >
        <aside className="hidden lg:flex lg:w-[280px] lg:shrink-0">
          <div className="sticky top-6 flex h-[calc(100vh-3rem)] min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-sidebar-border/80 bg-sidebar/92 p-4 shadow-[0_28px_60px_-42px_rgba(14,47,89,0.42)] backdrop-blur">
            <ShellBrand subtitle={subtitle} />

            <nav className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <DashboardNavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    unreadCount={unreadCount}
                    chatHref={chatHref}
                  />
                ))}
              </div>
            </nav>

            <div className="mt-5 flex shrink-0 flex-col gap-3 border-t border-sidebar-border/70 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-secondary-foreground">
                    {user.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <LogoutForm />
            </div>
          </div>
        </aside>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            isChatRoom ? "gap-0 pb-0 lg:gap-4 lg:pb-6" : "gap-4 pb-6"
          )}
        >
          <header
            className={cn(
              "sticky top-3 z-20 rounded-3xl border border-border/80 bg-background/90 px-3 py-2.5 shadow-[0_22px_48px_-44px_rgba(14,47,89,0.28)] backdrop-blur sm:px-4 sm:py-3",
              isChatRoom && "hidden lg:block"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {mobileNavigation === "drawer" ? (
                  <Drawer
                    direction="left"
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                  >
                    <DrawerTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        aria-label="Buka navigasi"
                        className="rounded-xl lg:hidden"
                      >
                        <MenuIcon />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="flex h-[100dvh] max-h-[100dvh] flex-col border-sidebar-border/80 bg-sidebar px-5 pb-5">
                      <DrawerHeader className="items-start px-0 pt-4 text-left">
                        <div className="flex w-full items-start justify-between gap-4">
                          <DrawerTitle className="sr-only">
                            Navigasi Medisigna
                          </DrawerTitle>
                          <ShellBrand subtitle={subtitle} />
                          <DrawerClose asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              aria-label="Tutup navigasi"
                              className="rounded-xl"
                            >
                              <XIcon />
                            </Button>
                          </DrawerClose>
                        </div>
                      </DrawerHeader>

                      <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                        <div className="flex flex-col gap-2">
                          {navItems.map((item) => (
                            <DashboardNavLink
                              key={item.href}
                              item={item}
                              pathname={pathname}
                              unreadCount={unreadCount}
                              chatHref={chatHref}
                              onClick={() => setDrawerOpen(false)}
                              drawer
                            />
                          ))}
                        </div>
                      </div>

                      <DrawerFooter className="mt-4 border-t border-sidebar-border/70 px-0 pt-4">
                        <LogoutForm />
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                ) : null}

                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-secondary-foreground sm:text-xl">
                    {title}
                  </h1>
                  <p className="truncate text-xs text-muted-foreground">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <ThemeToggle />
                <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                  {initials}
                </div>
                <div className="hidden min-w-0 text-right text-xs md:block">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-muted-foreground">{user.email}</p>
                </div>
                <div className="lg:hidden">
                  <LogoutForm compact />
                </div>
              </div>
            </div>
          </header>

          <main
            className={cn(
              "min-w-0 flex-1 overflow-x-clip",
              isChatRoom && "min-h-0",
              mobileNavigation === "bottom" && !isChatRoom && "pb-24 lg:pb-0"
            )}
          >
            {children}
          </main>
        </div>
      </div>
      {mobileNavigation === "bottom" && !isChatRoom ? (
        <nav className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-20 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/70 bg-background/85 p-2 shadow-[0_22px_48px_-32px_rgba(14,47,89,0.35)] backdrop-blur-xl lg:hidden">
          <div
            className={cn(
              "grid gap-1",
              navItems.length === 2
                ? "grid-cols-2"
                : navItems.length === 5
                  ? "grid-cols-5"
                  : navItems.length === 6
                    ? "grid-cols-3"
                    : "grid-cols-4"
            )}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActivePath(pathname, item)
              const showUnread = item.href === chatHref && unreadCount > 0

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-medium text-muted-foreground transition-colors",
                    active && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span className="max-w-full truncate">{item.label}</span>
                  {showUnread ? (
                    <span className="absolute top-1.5 right-3 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </nav>
      ) : null}
    </div>
  )
}
