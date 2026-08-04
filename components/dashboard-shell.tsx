"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronDownIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react"

import { logout } from "@/app/actions/auth/logout"
import { BrandLogo } from "@/components/brand-logo"
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
  iconSrc?: string
  children?: DashboardNavItem[]
  exact?: boolean
  hideOnMobileNav?: boolean
}

type DashboardShellProps = {
  children: React.ReactNode
  user: { name: string; email: string }
  navItems: DashboardNavItem[]
  subtitle: string
  initialUnreadCount?: number
  chatHref?: string
  profileHref?: string
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
  if (item.children?.some((child) => isActivePath(pathname, child))) return true
  if (item.exact) return pathname === item.href
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

function pageTitle(pathname: string, navItems: DashboardNavItem[]) {
  for (const item of navItems) {
    const child = item.children?.find((entry) => isActivePath(pathname, entry))
    if (child) return child.label
    if (isActivePath(pathname, item)) return item.label
  }

  return "Dashboard"
}

function hasActiveChild(pathname: string, item: DashboardNavItem) {
  return item.children?.some((child) => isActivePath(pathname, child)) ?? false
}

function ShellBrand({ subtitle }: { subtitle: string }) {
  return (
    <Link
      href="/"
      className="rounded-2xl bg-card px-4 py-4 transition-colors hover:bg-muted/60"
      aria-label="Medisigna"
    >
      <div className="flex items-center gap-3">
        <BrandLogo className="size-10 rounded-xl" />
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

function DashboardNavBody({
  item,
  active,
  showUnread,
  unreadCount,
}: {
  item: DashboardNavItem
  active: boolean
  showUnread: boolean
  unreadCount: number
}) {
  const Icon = item.icon

  return (
    <>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
          active
            ? "bg-primary/10 text-primary"
            : "bg-secondary text-primary"
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 text-left">
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
    </>
  )
}

function navLinkClass(active: boolean, drawer: boolean) {
  return cn(
    "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 transition-all",
    active
      ? "bg-secondary text-secondary-foreground"
      : "text-muted-foreground hover:bg-secondary/80 hover:text-secondary-foreground",
    drawer && "rounded-xl py-2.5"
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
  const active = isActivePath(pathname, item)
  const showUnread = item.href === chatHref && unreadCount > 0

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={navLinkClass(active, drawer)}
    >
      <DashboardNavBody
        item={item}
        active={active}
        showUnread={showUnread}
        unreadCount={unreadCount}
      />
    </Link>
  )
}

function DashboardNavToggle({
  item,
  open,
  pathname,
  unreadCount,
  drawer = false,
  onToggle,
}: {
  item: DashboardNavItem
  open: boolean
  pathname: string
  unreadCount: number
  drawer?: boolean
  onToggle: () => void
}) {
  const active = isActivePath(pathname, item)

  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className={cn(navLinkClass(active, drawer), "cursor-pointer")}
    >
      <DashboardNavBody
        item={item}
        active={active}
        showUnread={false}
        unreadCount={unreadCount}
      />
      <ChevronDownIcon
        className={cn(
          "size-4 shrink-0 transition-transform",
          open && "rotate-180"
        )}
        aria-hidden="true"
      />
    </button>
  )
}

function DashboardNavEntry({
  item,
  pathname,
  unreadCount,
  chatHref,
  onClick,
  open,
  onToggle,
  drawer = false,
}: {
  item: DashboardNavItem
  pathname: string
  unreadCount: number
  chatHref?: string
  onClick?: () => void
  open?: boolean
  onToggle?: () => void
  drawer?: boolean
}) {
  const hasChildren = Boolean(item.children?.length)

  return (
    <div className="flex flex-col gap-1">
      {hasChildren ? (
        <DashboardNavToggle
          item={item}
          open={Boolean(open)}
          pathname={pathname}
          unreadCount={unreadCount}
          drawer={drawer}
          onToggle={onToggle ?? (() => {})}
        />
      ) : (
        <DashboardNavLink
          item={item}
          pathname={pathname}
          unreadCount={unreadCount}
          chatHref={chatHref}
          onClick={onClick}
          drawer={drawer}
        />
      )}
      {hasChildren && open ? (
        <div className="ml-6 flex flex-col gap-1 border-l border-sidebar-border/70 pl-3">
          {item.children?.map((child) => (
            <DashboardNavLink
              key={child.href}
              item={child}
              pathname={pathname}
              unreadCount={unreadCount}
              chatHref={chatHref}
              onClick={onClick}
              drawer={drawer}
            />
          ))}
        </div>
      ) : null}
    </div>
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
  profileHref,
  mobileNavigation = "drawer",
}: DashboardShellProps) {
  const pathname = usePathname()
  const title = pageTitle(pathname, navItems)
  const isChatRoom = chatHref ? pathname.startsWith(`${chatHref}/`) : false
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openNavItems, setOpenNavItems] = useState<Record<string, boolean>>({})
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [mobileNavHidden, setMobileNavHidden] = useState(false)
  const lastScrollYRef = useRef(0)
  const scrollFrameRef = useRef<number | null>(null)
  const initials = getUserInitials(user.name)
  const mobileNavItems = navItems.filter((item) => !item.hideOnMobileNav)
  const shouldHideMobileNav =
    mobileNavigation === "bottom" && !isChatRoom && mobileNavHidden

  const toggleNavItem = useCallback((href: string) => {
    setOpenNavItems((current) => ({
      ...current,
      [href]: !current[href],
    }))
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    const response = await fetch("/api/consultation/unread", {
      cache: "no-store",
    })
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

  useEffect(() => {
    if (mobileNavigation !== "bottom" || isChatRoom) {
      return
    }

    lastScrollYRef.current = window.scrollY

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) return

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        const currentScrollY = Math.max(window.scrollY, 0)
        const delta = currentScrollY - lastScrollYRef.current

        if (currentScrollY < 24) {
          setMobileNavHidden(false)
          lastScrollYRef.current = currentScrollY
          scrollFrameRef.current = null
          return
        }

        if (Math.abs(delta) > 8) {
          setMobileNavHidden(delta > 0)
          lastScrollYRef.current = currentScrollY
        }

        scrollFrameRef.current = null
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = null
      }
    }
  }, [isChatRoom, mobileNavigation])

  return (
    <div className="min-h-screen bg-secondary">
      <div
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-[1540px]",
          isChatRoom
            ? "gap-0 px-0 py-0 lg:gap-4 lg:px-8 lg:py-6"
            : "gap-4 px-4 py-4 sm:px-6 sm:py-6 xl:px-8"
        )}
      >
        <aside className="hidden lg:flex lg:w-[280px] lg:shrink-0">
          <div className="sticky top-6 flex h-[calc(100vh-3rem)] min-h-0 w-full flex-col overflow-hidden rounded-3xl bg-card p-4 shadow-none">
            <ShellBrand subtitle={subtitle} />

            <nav className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <DashboardNavEntry
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    unreadCount={unreadCount}
                    chatHref={chatHref}
                    open={Boolean(
                      openNavItems[item.href] || hasActiveChild(pathname, item)
                    )}
                    onToggle={() => toggleNavItem(item.href)}
                  />
                ))}
              </div>
            </nav>

            <div className="mt-5 flex shrink-0 flex-col gap-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
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
              "rounded-xl bg-card px-3 py-2.5 shadow-none sm:px-4 sm:py-3 lg:sticky lg:top-3 lg:z-20",
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
                            <DashboardNavEntry
                              key={item.href}
                              item={item}
                              pathname={pathname}
                              unreadCount={unreadCount}
                              chatHref={chatHref}
                              onClick={() => setDrawerOpen(false)}
                              open={Boolean(
                                openNavItems[item.href] ||
                                hasActiveChild(pathname, item)
                              )}
                              onToggle={() => toggleNavItem(item.href)}
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
                <Link
                  href={profileHref ?? "#"}
                  aria-label="Buka profil"
                  className="flex min-w-0 items-center gap-2 rounded-full transition-colors hover:bg-muted/70"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                    {initials}
                  </span>
                  <span className="hidden min-w-0 text-right text-xs md:block">
                    <span className="block truncate font-medium">
                      {user.name}
                    </span>
                    <span className="block truncate text-muted-foreground">
                      {user.email}
                    </span>
                  </span>
                </Link>
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
        <nav
          className={cn(
            "fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-20 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/70 bg-background/85 p-2 shadow-[0_22px_48px_-32px_rgba(14,47,89,0.35)] backdrop-blur-xl transition-all duration-300 ease-out lg:hidden",
            shouldHideMobileNav &&
              "pointer-events-none translate-y-[calc(100%+1.25rem)] opacity-0"
          )}
        >
          <div
            className={cn(
              "grid gap-1",
              mobileNavItems.length === 2
                ? "grid-cols-2"
                : mobileNavItems.length === 5
                  ? "grid-cols-5"
                  : mobileNavItems.length === 6
                    ? "grid-cols-3"
                    : "grid-cols-4"
            )}
          >
            {mobileNavItems.map((item) => {
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
                    active && "bg-primary/10 text-primary"
                  )}
                >
                  {item.iconSrc ? (
                    <img
                      src={item.iconSrc}
                      alt=""
                      aria-hidden="true"
                      className="size-5 object-contain"
                    />
                  ) : (
                    <Icon className="size-4" />
                  )}
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
