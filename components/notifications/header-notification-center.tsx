"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { BellIcon, CheckCheckIcon, MessageSquareIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type AppNotification = {
  id: string
  title: string
  body: string
  link?: string | null
  isRead: boolean
  type: string
  createdAt: string
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return "Baru saja"
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}j yang lalu`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}h yang lalu`

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

export function HeaderNotificationCenter() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()

    const events = new EventSource("/api/consultation/events")
    events.onmessage = () => {
      fetchNotifications()
    }

    const interval = setInterval(fetchNotifications, 15000)
    return () => {
      events.close()
      clearInterval(interval)
    }
  }, [fetchNotifications])


  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      })
    } catch (err) {
      console.error("Gagal menandai semua notifikasi:", err)
      fetchNotifications()
    }
  }

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === notif.id ? { ...item, isRead: true } : item))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id }),
      }).catch(() => {})
    }
    setOpen(false)
  }

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="rounded-full"
        aria-label="Notifikasi"
        title="Notifikasi"
      >
        <BellIcon className="size-5" />
      </Button>
    )
  }

  return (

    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="relative rounded-full transition-transform active:scale-95"
          aria-label="Notifikasi"
          title="Notifikasi"
        >
          <BellIcon className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 rounded-2xl p-0 shadow-xl border-border/80 bg-card overflow-hidden z-50"
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {unreadCount} baru
              </span>
            ) : null}
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <CheckCheckIcon className="size-3.5" />
              Tandai dibaca
            </button>
          ) : null}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 overscroll-contain">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-2">
                <BellIcon className="size-6" />
              </span>
              <p className="text-xs font-medium text-foreground">Belum Ada Notifikasi</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Notifikasi balasan konseling dan pesan baru akan muncul di sini.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const targetLink = item.link || "/dashboard/chat"

              return (
                <DropdownMenuItem key={item.id} asChild className="p-0 focus:bg-muted/50 cursor-pointer">
                  <Link
                    href={targetLink}
                    onClick={() => handleNotificationClick(item)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 transition-colors w-full",
                      !item.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/40"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                        !item.isRead
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <MessageSquareIcon className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4
                          className={cn(
                            "truncate text-xs font-semibold",
                            !item.isRead ? "text-foreground font-bold" : "text-foreground/80"
                          )}
                        >
                          {item.title}
                        </h4>
                        <span className="shrink-0 text-[10px] text-muted-foreground font-mono">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {item.body}
                      </p>
                    </div>

                    {!item.isRead ? (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    ) : null}
                  </Link>
                </DropdownMenuItem>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
