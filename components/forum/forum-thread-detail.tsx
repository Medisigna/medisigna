import Link from "next/link"
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  CalendarIcon,
  LockIcon,
  MessageSquareTextIcon,
  PinIcon,
} from "lucide-react"

import { ForumBadge } from "@/components/forum/forum-badge"
import { ForumCommentActions } from "@/components/forum/forum-comment-actions"
import { ForumImagePreviewDialog } from "@/components/forum/forum-image-preview-dialog"
import { ForumMarkRead } from "@/components/forum/forum-mark-read"
import { ForumReplyComposer } from "@/components/forum/forum-composer"
import { ForumReplyOwnerActions } from "@/components/forum/forum-reply-owner-actions"
import { ForumShareDialog } from "@/components/forum/forum-share-dialog"
import { ForumThreadActionsMenu } from "@/components/forum/forum-thread-actions-menu"
import { MarkdownPreview } from "@/components/markdown-preview"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ForumPostAttachmentItem, ForumPostItem, ForumThreadDetail } from "@/lib/forum"
import { forumAuthorName } from "@/lib/forum"

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function ForumAuthor({
  post,
  size = "md",
}: {
  post: ForumPostItem
  size?: "sm" | "md"
}) {
  const name = forumAuthorName({
    authorName: post.authorName,
    authorRole: post.authorRole,
  })

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={size === "md" ? "size-9 sm:size-10" : "size-8"}>
        <AvatarImage src={post.authorImage ?? undefined} alt={name} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground">{name}</p>
          {post.authorRole === "PHARMACIST" ? (
            <span
              className="inline-flex text-primary"
              aria-label="Apoteker terverifikasi"
              title="Apoteker terverifikasi"
            >
              <BadgeCheckIcon className="size-3.5" aria-hidden="true" />
            </span>
          ) : null}
        </div>
        {post.authorTitle ? (
          <p className="truncate text-xs text-muted-foreground">{post.authorTitle}</p>
        ) : null}
      </div>
    </div>
  )
}

function HiddenPost({ reason }: { reason: string | null }) {
  return (
    <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      Konten disembunyikan admin.
      {reason ? ` Alasan: ${reason}` : ""}
    </p>
  )
}

function ForumAttachmentGallery({ attachments }: { attachments: ForumPostAttachmentItem[] }) {
  const gallery = attachments.filter((attachment) => !attachment.isInline)
  if (!gallery.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {gallery.map((attachment) => (
        <ForumImagePreviewDialog
          key={attachment.id}
          src={attachment.fileUrl}
          alt={attachment.altText ?? attachment.fileName}
          title={attachment.fileName}
        >
          <button
            type="button"
            className="overflow-hidden rounded-md border bg-muted/20 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <img
              src={attachment.fileUrl}
              alt={attachment.altText ?? attachment.fileName}
              className="aspect-video w-full object-cover"
            />
          </button>
        </ForumImagePreviewDialog>
      ))}
    </div>
  )
}

function ForumReplyItem({
  canReply,
  currentUserId,
  depth = 0,
  post,
  repliesByParentId,
  replyDisabledMessage,
  threadHref,
  threadId,
  threadTitle,
}: {
  canReply: boolean
  currentUserId: string
  depth?: number
  post: ForumPostItem
  repliesByParentId: Map<string, ForumPostItem[]>
  replyDisabledMessage?: string
  threadHref: string
  threadId: string
  threadTitle: string
}) {
  const postAuthorName = forumAuthorName({
    authorName: post.authorName,
    authorRole: post.authorRole,
  })
  const childReplies = repliesByParentId.get(post.id) ?? []

  return (
    <article id={`post-${post.id}`} className={depth === 0 ? "p-5 sm:p-6" : "pt-5"}>
      <div className="ml-3 min-w-0 border-l pl-4 sm:ml-6 sm:pl-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <ForumAuthor post={post} size="sm" />
            <p className="ml-11 mt-1 text-xs text-muted-foreground">
              {formatDate(post.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {post.status === "HIDDEN" ? (
              <ForumBadge tone="danger">Disembunyikan</ForumBadge>
            ) : null}
            {post.status === "VISIBLE" && post.authorId === currentUserId ? (
              <ForumReplyOwnerActions postId={post.id} bodyMarkdown={post.bodyMarkdown} />
            ) : null}
          </div>
        </div>
        {post.status === "HIDDEN" ? (
          <HiddenPost reason={post.hiddenReason} />
        ) : (
          <div className="flex flex-col gap-4">
            {post.bodyMarkdown ? <MarkdownPreview source={post.bodyMarkdown} /> : null}
            <ForumAttachmentGallery attachments={post.attachments} />
            <ForumCommentActions
              canReply={canReply}
              disabledMessage={replyDisabledMessage}
              parentPostId={post.id}
              replyCount={childReplies.length}
              replyToName={postAuthorName}
              shareHref={`${threadHref}#post-${post.id}`}
              shareTitle={threadTitle}
              threadId={threadId}
            />
          </div>
        )}
        {childReplies.length ? (
          <div className="mt-5 flex flex-col gap-5">
            {childReplies.map((reply) => (
              <ForumReplyItem
                key={reply.id}
                canReply={canReply}
                currentUserId={currentUserId}
                depth={depth + 1}
                post={reply}
                repliesByParentId={repliesByParentId}
                replyDisabledMessage={replyDisabledMessage}
                threadHref={threadHref}
                threadId={threadId}
                threadTitle={threadTitle}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function ForumThreadDetailView({
  basePath,
  canReport,
  canReply,
  currentUserId,
  replyDisabledMessage,
  thread,
}: {
  basePath: string
  canReport: boolean
  canReply: boolean
  currentUserId: string
  replyDisabledMessage?: string
  thread: ForumThreadDetail
}) {
  const [firstPost, ...replies] = thread.posts
  const replyCount = Math.max(thread.postCount - 1, 0)
  const threadHref = `${basePath}/${thread.slug}`
  const repliesByParentId = new Map<string, ForumPostItem[]>()
  const topLevelReplies: ForumPostItem[] = []

  for (const post of replies) {
    if (!post.parentPostId || post.parentPostId === firstPost?.id) {
      topLevelReplies.push(post)
      continue
    }

    const children = repliesByParentId.get(post.parentPostId) ?? []
    children.push(post)
    repliesByParentId.set(post.parentPostId, children)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <ForumMarkRead threadId={thread.id} />
      <Button asChild variant="ghost" className="w-fit">
        <Link href={basePath}>
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali
        </Link>
      </Button>

      <Card className="overflow-hidden rounded-xl border-0 bg-background shadow-sm ring-1 ring-border/70">
        <CardContent className="p-0">
          <article
            id={firstPost ? `post-${firstPost.id}` : undefined}
            className="flex flex-col gap-5 p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              {firstPost ? <ForumAuthor post={firstPost} /> : null}
              <div className="flex shrink-0 items-center gap-2">
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
                <ForumThreadActionsMenu
                  canEdit={currentUserId === thread.authorId}
                  canReport={canReport}
                  editHref={`${threadHref}/edit`}
                  targetId={thread.id}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <ForumBadge>{thread.categoryName}</ForumBadge>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon aria-hidden="true" />
                {formatDate(thread.createdAt)}
              </span>
            </div>

            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {thread.title}
            </h1>

            {firstPost?.status === "HIDDEN" ? (
              <HiddenPost reason={firstPost.hiddenReason} />
            ) : firstPost ? (
              <div className="flex flex-col gap-4">
                {firstPost.bodyMarkdown ? <MarkdownPreview source={firstPost.bodyMarkdown} /> : null}
                <ForumAttachmentGallery attachments={firstPost.attachments} />
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-5 border-t pt-4 text-sm text-muted-foreground">
              <Button asChild variant="ghost" size="sm" aria-label={`${replyCount} komentar`}>
                <a href="#forum-reply-composer">
                  <MessageSquareTextIcon aria-hidden="true" />
                  <span className="text-xs font-medium">{replyCount}</span>
                </a>
              </Button>
              <ForumShareDialog href={threadHref} title={thread.title} label="Share" />
            </div>
          </article>

          <div className="border-t">
            {topLevelReplies.length ? (
              <div className="flex flex-col divide-y">
                {topLevelReplies.map((post) => (
                  <ForumReplyItem
                    key={post.id}
                    canReply={canReply}
                    currentUserId={currentUserId}
                    post={post}
                    repliesByParentId={repliesByParentId}
                    replyDisabledMessage={replyDisabledMessage}
                    threadHref={threadHref}
                    threadId={thread.id}
                    threadTitle={thread.title}
                  />
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground sm:px-6">
                Belum ada balasan.
              </div>
            )}
          </div>

          <div id="forum-reply-composer" className="border-t">
            <ForumReplyComposer
              threadId={thread.id}
              disabled={!canReply}
              disabledMessage={replyDisabledMessage}
              inline
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
