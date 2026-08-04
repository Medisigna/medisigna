import Link from "next/link"
import {
  BadgeCheckIcon,
  LockIcon,
  MessageSquareTextIcon,
  PinIcon,
} from "lucide-react"

import { ForumBadge } from "@/components/forum/forum-badge"
import { ForumEmptyState } from "@/components/forum/forum-empty-state"
import { ForumImagePreviewDialog } from "@/components/forum/forum-image-preview-dialog"
import { ForumShareDialog } from "@/components/forum/forum-share-dialog"
import { ForumThreadFilters } from "@/components/forum/forum-thread-filters"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type {
  ForumCategoryItem,
  ForumPostAttachmentItem,
  ForumThreadListItem,
} from "@/lib/forum"
import { forumAuthorName } from "@/lib/forum"
import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function ForumThreadAttachmentStrip({
  attachments,
}: {
  attachments: ForumPostAttachmentItem[]
}) {
  if (!attachments.length) return null

  const visibleAttachments = attachments.slice(0, 3)
  const hiddenCount = attachments.length - visibleAttachments.length
  const gridClass =
    visibleAttachments.length === 1
      ? "max-w-sm grid-cols-1"
      : visibleAttachments.length === 2
        ? "max-w-lg grid-cols-2"
        : "max-w-2xl grid-cols-3"

  return (
    <div
      className={`pointer-events-auto relative z-10 mx-auto mt-4 grid w-full gap-2 ${gridClass}`}
    >
      {visibleAttachments.map((attachment, index) => (
        <ForumImagePreviewDialog
          key={attachment.id}
          src={attachment.fileUrl}
          alt={attachment.altText ?? attachment.fileName}
          title={attachment.fileName}
        >
          <button
            type="button"
            className="group/preview relative overflow-hidden rounded-md border bg-muted/20 text-left transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <img
              src={attachment.fileUrl}
              alt={attachment.altText ?? attachment.fileName}
              className="aspect-video w-full object-cover"
            />
            {index === visibleAttachments.length - 1 && hiddenCount > 0 ? (
              <span className="absolute inset-0 flex items-center justify-center bg-foreground/55 text-sm font-semibold text-background">
                +{hiddenCount}
              </span>
            ) : null}
          </button>
        </ForumImagePreviewDialog>
      ))}
    </div>
  )
}

export function ForumThreadList({
  basePath,
  categories,
  category,
  query,
  threads,
  total,
  unreadTotal,
  variant = "default",
}: {
  basePath: string
  categories: ForumCategoryItem[]
  category?: string
  query?: string
  threads: ForumThreadListItem[]
  total: number
  unreadTotal: number
  variant?: "default" | "soft"
}) {
  const isSoft = variant === "soft"

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-secondary-foreground">
            Forum Diskusi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} diskusi
            {unreadTotal > 0 ? ` · ${unreadTotal} belum dibaca` : ""}
          </p>
        </div>
      </div>

      <ForumThreadFilters
        categories={categories}
        category={category}
        query={query}
        variant={variant}
      />

      {threads.length ? (
        <div className="flex flex-col gap-4">
          {threads.map((thread) => {
            const detailHref = `${basePath}/${thread.slug}`
            const replyCount = Math.max(thread.postCount - 1, 0)
            const authorName = forumAuthorName({
              authorName: thread.authorName,
              authorRole: thread.authorRole,
            })

            return (
              <Card
                key={thread.id}
                className={cn(
                  "relative border-0 transition-shadow",
                  isSoft
                    ? "rounded-[1.75rem] bg-card shadow-none ring-0 hover:shadow-none"
                    : "rounded-xl bg-background shadow-sm hover:shadow-md"
                )}
              >
                <Link
                  href={detailHref}
                  className={cn(
                    "absolute inset-0 z-0 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    isSoft ? "rounded-[1.75rem]" : "rounded-xl"
                  )}
                  aria-label={`Buka diskusi ${thread.title}`}
                />
                <CardContent className="pointer-events-none relative z-10 px-4 py-4 sm:px-5 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-4">
                      <Avatar className="size-9 shrink-0 sm:size-10">
                        <AvatarImage
                          src={thread.authorImage ?? undefined}
                          alt={authorName}
                        />
                        <AvatarFallback>{initials(authorName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-base font-semibold text-foreground">
                            {authorName}
                          </p>
                          {thread.authorRole === "PHARMACIST" ? (
                            <span
                              className="inline-flex text-primary"
                              aria-label="Apoteker terverifikasi"
                              title="Apoteker terverifikasi"
                            >
                              <BadgeCheckIcon
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <ForumBadge tone="category">
                            {thread.categoryName}
                          </ForumBadge>
                          <span>{formatDate(thread.lastPostAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="mt-4 line-clamp-3 text-xl leading-snug font-semibold tracking-tight text-foreground group-hover/card:underline">
                    {thread.title}
                  </h2>

                  <ForumThreadAttachmentStrip
                    attachments={thread.attachments}
                  />

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquareTextIcon aria-hidden="true" />
                        <span className="font-medium text-primary">
                          {replyCount}
                        </span>
                      </span>
                      <div className="pointer-events-auto relative z-10">
                        <ForumShareDialog
                          href={detailHref}
                          title={thread.title}
                          label="Share"
                        />
                      </div>
                      {thread.isPinned ? (
                        <ForumBadge tone="primary">
                          <PinIcon aria-hidden="true" />
                          Pin
                        </ForumBadge>
                      ) : null}
                      {thread.status === "LOCKED" ? (
                        <ForumBadge tone="warning">
                          <LockIcon aria-hidden="true" />
                          Dikunci
                        </ForumBadge>
                      ) : null}
                      {thread.unreadCount > 0 ? (
                        <ForumBadge tone="primary">
                          {thread.unreadCount} baru
                        </ForumBadge>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div>
          <ForumEmptyState
            title="Belum ada diskusi"
            description="Mulai diskusi baru atau ubah filter pencarian."
          />
        </div>
      )}
    </div>
  )
}
