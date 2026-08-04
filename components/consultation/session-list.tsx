"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { CheckCircle2Icon, MessageCircleIcon, SearchIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { TypingIndicator } from "./typing-indicator"

export type SessionListItem = {
  id: string
  name: string
  status: string
  lastMessage: string
  updatedAt: string
  unreadCount: number
}

export function SessionList({
  sessions,
  basePath = "/dashboard/chat",
  activeSessionId,
  statuses,
  filterable = false,
  variant = "default",
}: {
  sessions: SessionListItem[]
  basePath?: string
  activeSessionId?: string
  statuses?: string[]
  filterable?: boolean
  variant?: "default" | "soft"
}) {
  const [currentSessions, setCurrentSessions] = useState(sessions)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState("active")
  const [typingSessionIds, setTypingSessionIds] = useState<Set<string>>(
    new Set()
  )
  const typingTimersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>()
  )
  const isSoft = variant === "soft"

  const fetchSessions = useCallback(async () => {
    const response = await fetch("/api/consultation/sessions", {
      cache: "no-store",
    })
    if (!response.ok) return
    const data = await response.json()
    setCurrentSessions(
      statuses?.length
        ? data.sessions.filter((session: SessionListItem) =>
            statuses.includes(session.status)
          )
        : data.sessions
    )
  }, [statuses])

  useEffect(() => {
    setCurrentSessions(sessions)
  }, [sessions])

  useEffect(() => {
    const events = new EventSource("/api/consultation/events")
    events.onmessage = (message) => {
      if (message.data === "refresh") {
        fetchSessions()
        return
      }

      let event: {
        type?: string
        sessionId: string
        isTyping?: boolean
      }
      try {
        event = JSON.parse(message.data)
      } catch {
        fetchSessions()
        return
      }
      if (event.type !== "typing") {
        fetchSessions()
        return
      }

      clearTimeout(typingTimersRef.current.get(event.sessionId))
      setTypingSessionIds((current) => {
        const next = new Set(current)
        event.isTyping
          ? next.add(event.sessionId)
          : next.delete(event.sessionId)
        return next
      })

      if (event.isTyping) {
        typingTimersRef.current.set(
          event.sessionId,
          setTimeout(() => {
            setTypingSessionIds((current) => {
              const next = new Set(current)
              next.delete(event.sessionId)
              return next
            })
          }, 2500)
        )
      }
    }
    return () => {
      events.close()
      typingTimersRef.current.forEach(clearTimeout)
    }
  }, [fetchSessions])

  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
  const visibleSessions = currentSessions.filter((session) => {
    const isDone = ["COMPLETED", "REFERRED", "CANCELED"].includes(
      session.status
    )
    const matchesTab = tab === "all" || (tab === "done" ? isDone : !isDone)
    const matchesQuery =
      !normalizedQuery ||
      session.name.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
      session.lastMessage.toLocaleLowerCase("id-ID").includes(normalizedQuery)

    return matchesTab && matchesQuery
  })

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      {filterable ? (
        <div className="flex shrink-0 flex-col gap-3">
          <InputGroup
            className={cn(
              isSoft && "h-11 rounded-2xl border-0 bg-card shadow-none ring-0"
            )}
          >
            <InputGroupAddon>
              <SearchIcon aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari chat..."
              aria-label="Cari riwayat chat"
            />
          </InputGroup>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="active">Aktif</TabsTrigger>
              <TabsTrigger value="done">Selesai</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 sm:gap-3">
        {visibleSessions.length ? (
          visibleSessions.map((session) => {
            const isActive = activeSessionId === session.id
            const isDone = ["COMPLETED", "REFERRED", "CANCELED"].includes(
              session.status
            )

            return (
              <Link
                key={session.id}
                href={`${basePath}/${session.id}`}
                className={cn(
                  "group relative block min-w-0 shrink-0 overflow-hidden rounded-lg bg-muted/35 p-3 transition-colors hover:bg-muted/70 sm:p-4",
                  isSoft && "rounded-[1.35rem] bg-card hover:bg-card/80",
                  isActive && "bg-primary/10"
                )}
              >
                <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary opacity-0 transition-opacity group-hover:opacity-40" />
                <div
                  className={cn(
                    "absolute inset-y-3 left-0 w-1 rounded-r-full bg-primary",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar
                    className="shrink-0 bg-primary/10 text-primary"
                    size="lg"
                  >
                    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                      {getInitials(session.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="min-w-0 flex-1 truncate leading-6 font-semibold">
                        {session.name}
                      </h2>
                      {session.unreadCount > 0 ? (
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-xs">
                          {session.unreadCount > 99
                            ? "99+"
                            : session.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 h-5">
                      {typingSessionIds.has(session.id) ? (
                        <TypingIndicator />
                      ) : (
                        <p
                          className={cn(
                            "flex min-w-0 items-center gap-1.5 text-sm",
                            session.unreadCount > 0
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2Icon
                              className="size-4 shrink-0"
                              aria-hidden="true"
                            />
                          ) : null}
                          <span className="truncate">
                            {isDone
                              ? "Konsultasi selesai"
                              : session.lastMessage}
                          </span>
                        </p>
                      )}
                    </div>
                    <p className="mt-2 truncate text-[11px] text-muted-foreground">
                      {formatUpdatedAt(session.updatedAt)}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div
            className={cn(
              "flex min-h-40 flex-1 flex-col items-center justify-center gap-3 border border-dashed bg-card/70 p-6 text-center",
              isSoft
                ? "rounded-[1.75rem] border-0 bg-card"
                : "rounded-lg"
            )}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleIcon className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">
              {currentSessions.length
                ? "Chat tidak ditemukan."
                : "Belum ada chat."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}
