"use client"

import { useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import toast from "react-hot-toast"

import {
  requestNotificationPermissionAndGetToken,
  registerForegroundMessageHandler,
} from "@/lib/firebase/client"

export function NotificationPermissionPrompt() {
  const pathname = usePathname()

  const registerServiceWorker = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""
        const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ""
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""
        const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""
        const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ""
        const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""

        const swUrl = `/firebase-messaging-sw.js?apiKey=${encodeURIComponent(apiKey)}&authDomain=${encodeURIComponent(authDomain)}&projectId=${encodeURIComponent(projectId)}&storageBucket=${encodeURIComponent(storageBucket)}&messagingSenderId=${encodeURIComponent(messagingSenderId)}&appId=${encodeURIComponent(appId)}`

        await navigator.serviceWorker.register(swUrl)
        await navigator.serviceWorker.ready
      } catch (err) {
        console.error("Gagal meregistrasi service worker FCM:", err)
      }
    }
  }, [])

  const saveTokenToServer = useCallback(async (token: string) => {
    try {
      const res = await fetch("/api/notifications/fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, deviceType: "web" }),
      })
      if (!res.ok) {
        throw new Error("Respon server gagal")
      }
    } catch (err) {
      console.error("Gagal mengunggah FCM token ke server:", err)
    }
  }, [])

  // Directly trigger native browser permission prompt when entering dashboard or navigating pages
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return
    }

    registerServiceWorker().then(() => {
      requestNotificationPermissionAndGetToken().then((token) => {
        if (token) {
          saveTokenToServer(token)
        }
      })
    })
  }, [pathname, registerServiceWorker, saveTokenToServer])

  // FCM Foreground Notification Handler
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    registerForegroundMessageHandler((msg) => {
      if (!msg.title && !msg.body) return

      toast(
        (t) => (
          <div className="flex flex-col gap-1 p-1">
            <div className="flex items-center justify-between gap-2 font-semibold text-secondary-foreground text-sm">
              <span>{msg.title || "Notifikasi Baru"}</span>
            </div>
            <p className="text-xs text-muted-foreground">{msg.body}</p>
            {msg.link ? (
              <div className="mt-1 flex justify-end">
                <Link
                  href={msg.link}
                  onClick={() => toast.dismiss(t.id)}
                  className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Buka Chat
                </Link>
              </div>
            ) : null}
          </div>
        ),
        {
          duration: 6000,
          position: "top-right",
          style: {
            borderRadius: "1rem",
            background: "var(--card)",
            color: "var(--card-foreground)",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            border: "1px solid var(--border)",
          },
        }
      )
    }).then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  // SSE Real-time Foreground Event Listener Fallback
  useEffect(() => {
    if (typeof window === "undefined") return

    const eventSource = new EventSource("/api/consultation/events")

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "refresh" && data.sessionId) {
          // Only show toast if user is not currently looking at the active chat room
          if (!pathname.includes(data.sessionId)) {
            toast(
              (t) => (
                <div className="flex flex-col gap-1 p-1">
                  <span className="font-semibold text-sm">💬 Pesan Chat Baru</span>
                  <p className="text-xs text-muted-foreground">Ada aktivitas atau balasan pesan baru di sesi konseling Anda.</p>
                  <div className="mt-1 flex justify-end">
                    <Link
                      href={`/dashboard/chat/${data.sessionId}`}
                      onClick={() => toast.dismiss(t.id)}
                      className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Buka Chat
                    </Link>
                  </div>
                </div>
              ),
              {
                id: `chat-event-${data.sessionId}`,
                duration: 5000,
                position: "top-right",
                style: {
                  borderRadius: "1rem",
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border)",
                },
              }
            )
          }
        }
      } catch (err) {
        // silent parse error
      }
    }

    return () => {
      eventSource.close()
    }
  }, [pathname])

  return null
}
