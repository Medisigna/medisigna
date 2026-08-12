import Link from "next/link"
import {
  BadgeCheckIcon,
  LockIcon,
  MessageSquareTextIcon,
  MoreHorizontalIcon,
  PinIcon,
} from "lucide-react"

import { ForumBadge } from "@/components/forum/forum-badge"
import { ForumEmptyState } from "@/components/forum/forum-empty-state"
import { ForumImagePreviewDialog } from "@/components/forum/forum-image-preview-dialog"
import { ForumLikeButton } from "@/components/forum/forum-like-button"
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
  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) return `${Math.max(Math.floor(diffMs / minute), 1)} menit`
  if (diffMs < day) return `${Math.floor(diffMs / hour)} jam`
  if (diffMs < 30 * day) return `${Math.floor(diffMs / day)} hari`

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
  }).format(date)
}

function plainPreview(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[#*_`>~]/g, "")
    .trim()
}

function ForumThreadAttachmentStrip({
  attachments,
}: {
  attachments: ForumPostAttachmentItem[]
}) {
  if (!attachments.length) return null

  const visibleAttachments = attachments.slice(0, 6)
  const hiddenCount = attachments.length - visibleAttachments.length
  const isSingle = visibleAttachments.length === 1

  return (
    <div
      className={cn(
        "pointer-events-auto relative z-10 mt-3",
        isSingle
          ? "max-w-md"
          : "flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      )}
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
            className={cn(
              "group/preview relative overflow-hidden rounded-xl border bg-card text-left transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              isSingle ? "w-full" : "w-[72vw] shrink-0 sm:w-52"
            )}
          >
            <img
              src={attachment.fileUrl}
              alt={attachment.altText ?? attachment.fileName}
              className={cn(
                "w-full object-cover",
                isSingle ? "max-h-96" : "aspect-[3/4]"
              )}
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
  currentUserId,
  query,
  threads,
  total,
  unreadTotal,
  variant = "default",
}: {
  basePath: string
  categories: ForumCategoryItem[]
  category?: string
  currentUserId?: string | null
  query?: string
  threads: ForumThreadListItem[]
  total: number
  unreadTotal: number
  variant?: "default" | "soft"
}) {
  const isSoft = variant === "soft"

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
      <div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-secondary-foreground">
            Forum Diskusi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} diskusi
            {unreadTotal > 0 ? ` - ${unreadTotal} belum dibaca` : ""}
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
        <div className="flex flex-col gap-3">
          {threads.map((thread) => {
            const detailHref = `${basePath}/${thread.slug}`
            const replyCount = Math.max(thread.postCount - 1, 0)
            const authorName = forumAuthorName({
              authorName: thread.authorName,
              authorRole: thread.authorRole,
            })
            const bodyPreview = thread.bodyMarkdown
              ? plainPreview(thread.bodyMarkdown)
              : null

            return (
              <Card
                key={thread.id}
                className={cn(
                  "relative border-0 bg-card py-0 transition-shadow",
                  isSoft
                    ? "rounded-2xl shadow-none ring-0 hover:shadow-none"
                    : "rounded-2xl shadow-sm hover:shadow-md"
                )}
              >
                <Link
                  href={detailHref}
                  className={cn(
                    "absolute inset-0 z-0 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    "rounded-2xl"
                  )}
                  aria-label={`Buka diskusi ${thread.title}`}
                />
                <CardContent className="pointer-events-none relative z-10 p-3 sm:p-4">
                  <article className="flex min-w-0 flex-col">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-10 shrink-0">
                          <AvatarImage
                            src={thread.authorImage ?? undefined}
                            alt={authorName}
                          />
                          <AvatarFallback>{initials(authorName)}</AvatarFallback>
                        </Avatar>

                        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm leading-5">
                          <span className="truncate font-semibold text-foreground">
                            {authorName}
                          </span>
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
                          <span className="text-muted-foreground">&gt;</span>
                          <span className="font-medium text-foreground">
                            {thread.categoryName}
                          </span>
                          <span className="text-muted-foreground">
                            {formatDate(thread.lastPostAt)}
                          </span>
                        </div>
                      </div>
                      <MoreHorizontalIcon
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>

                    <Link
                      href={detailHref}
                      className="pointer-events-auto relative z-10 mt-2 block text-[15px] leading-6 font-medium text-foreground hover:text-primary"
                    >
                      {thread.title}
                    </Link>

                    {bodyPreview && bodyPreview !== thread.title ? (
                      <p className="mt-1 line-clamp-8 whitespace-pre-line text-[15px] leading-6 text-foreground">
                        {bodyPreview}
                      </p>
                    ) : null}

                    <ForumThreadAttachmentStrip
                      attachments={thread.attachments}
                    />

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {thread.firstPostId ? (
                        <div className="pointer-events-auto relative z-10">
                          <ForumLikeButton
                            postId={thread.firstPostId}
                            initialLiked={thread.isLiked}
                            likeCount={thread.likeCount}
                            loginHref={
                              currentUserId
                                ? undefined
                                : `/login?callbackUrl=${encodeURIComponent(detailHref)}`
                            }
                          />
                        </div>
                      ) : null}
                      <span className="inline-flex items-center gap-1.5">
                        <MessageSquareTextIcon aria-hidden="true" />
                        <span>{replyCount}</span>
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
                  </article>
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
