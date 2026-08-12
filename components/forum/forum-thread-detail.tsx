import Link from "next/link"
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  LockIcon,
  MessageSquareTextIcon,
  PinIcon,
} from "lucide-react"

import { ForumBadge } from "@/components/forum/forum-badge"
import { ForumCommentActions } from "@/components/forum/forum-comment-actions"
import { ForumImagePreviewDialog } from "@/components/forum/forum-image-preview-dialog"
import { ForumLikeButton } from "@/components/forum/forum-like-button"
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

function ForumAuthorMeta({ post }: { post: ForumPostItem }) {
  const name = forumAuthorName({
    authorName: post.authorName,
    authorRole: post.authorRole,
  })

  return (
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

  const visibleAttachments = gallery.slice(0, 6)
  const hiddenCount = gallery.length - visibleAttachments.length
  const isSingle = visibleAttachments.length === 1

  return (
    <div
      className={cn(
        "mt-3",
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
              "relative overflow-hidden rounded-xl border bg-card text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
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

function ForumReplyItem({
  canReply,
  currentUserId,
  depth = 0,
  loginHref,
  post,
  repliesByParentId,
  replyDisabledMessage,
  threadHref,
  threadId,
  threadTitle,
}: {
  canReply: boolean
  currentUserId?: string | null
  depth?: number
  loginHref?: string
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
  const likeLoginHref = currentUserId
    ? undefined
    : `/login?callbackUrl=${encodeURIComponent(threadHref)}`

  return (
    <article
      id={`post-${post.id}`}
      className={cn(
        "grid grid-cols-[2rem_minmax(0,1fr)] gap-3",
        depth === 0 ? "p-5 sm:p-6" : "pt-5"
      )}
    >
      <div className="relative flex justify-center">
        {childReplies.length ? (
          <span
            className="absolute top-9 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border"
            aria-hidden="true"
          />
        ) : null}
        <Avatar className="relative z-10 size-8 shrink-0 bg-card">
          <AvatarImage src={post.authorImage ?? undefined} alt={postAuthorName} />
          <AvatarFallback>{initials(postAuthorName)}</AvatarFallback>
        </Avatar>
      </div>

      <div className="min-w-0">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <ForumAuthorMeta post={post} />
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
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
              isLiked={post.isLiked}
              likeCount={post.likeCount}
              likeLoginHref={likeLoginHref}
              loginHref={loginHref}
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
                loginHref={loginHref}
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
  editBasePath,
  loginHref,
  replyDisabledMessage,
  thread,
}: {
  basePath: string
  canReport: boolean
  canReply: boolean
  currentUserId?: string | null
  editBasePath?: string
  loginHref?: string
  replyDisabledMessage?: string
  thread: ForumThreadDetail
}) {
  const [firstPost, ...replies] = thread.posts
  const replyCount = Math.max(thread.postCount - 1, 0)
  const threadHref = `${basePath}/${thread.slug}`
  const editHref = `${editBasePath ?? basePath}/${thread.slug}/edit`
  const likeLoginHref = currentUserId
    ? undefined
    : `/login?callbackUrl=${encodeURIComponent(threadHref)}`
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
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3">
      {currentUserId ? <ForumMarkRead threadId={thread.id} /> : null}
      <Button asChild variant="ghost" className="w-fit">
        <Link href={basePath}>
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali
        </Link>
      </Button>

      <Card className="overflow-hidden rounded-2xl border-0 bg-card py-0 shadow-none ring-0">
        <CardContent className="p-0">
          <article
            id={firstPost ? `post-${firstPost.id}` : undefined}
            className="flex flex-col p-3 sm:p-4"
          >
            <div className="flex items-start justify-between gap-3">
              {firstPost ? (
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={firstPost.authorImage ?? undefined}
                      alt={forumAuthorName({
                        authorName: firstPost.authorName,
                        authorRole: firstPost.authorRole,
                      })}
                    />
                    <AvatarFallback>
                      {initials(
                        forumAuthorName({
                          authorName: firstPost.authorName,
                          authorRole: firstPost.authorRole,
                        })
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm leading-5">
                    <span className="truncate font-semibold text-foreground">
                      {forumAuthorName({
                        authorName: firstPost.authorName,
                        authorRole: firstPost.authorRole,
                      })}
                    </span>
                    {firstPost.authorRole === "PHARMACIST" ? (
                      <span
                        className="inline-flex text-primary"
                        aria-label="Apoteker terverifikasi"
                        title="Apoteker terverifikasi"
                      >
                        <BadgeCheckIcon className="size-3.5" aria-hidden="true" />
                      </span>
                    ) : null}
                    <span className="text-muted-foreground">&gt;</span>
                    <span className="font-medium text-foreground">
                      {thread.categoryName}
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(thread.createdAt)}
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="shrink-0">
                <ForumThreadActionsMenu
                  canEdit={currentUserId === thread.authorId}
                  canReport={canReport}
                  editHref={editHref}
                  targetId={thread.id}
                />
              </div>
            </div>

            <h1 className="mt-2 text-[15px] leading-6 font-medium text-foreground">
              {thread.title}
            </h1>

            {firstPost?.status === "HIDDEN" ? (
              <HiddenPost reason={firstPost.hiddenReason} />
            ) : firstPost ? (
              <div className="mt-1 flex flex-col">
                {firstPost.bodyMarkdown ? <MarkdownPreview source={firstPost.bodyMarkdown} /> : null}
                <ForumAttachmentGallery attachments={firstPost.attachments} />
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {firstPost ? (
                <ForumLikeButton
                  postId={firstPost.id}
                  initialLiked={firstPost.isLiked}
                  likeCount={firstPost.likeCount}
                  loginHref={likeLoginHref}
                />
              ) : null}
              <Button asChild variant="ghost" size="sm" aria-label={`${replyCount} komentar`}>
                <a href="#forum-reply-composer">
                  <MessageSquareTextIcon aria-hidden="true" />
                  <span className="text-xs font-medium">{replyCount}</span>
                </a>
              </Button>
              <ForumShareDialog href={threadHref} title={thread.title} label="Share" />
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
                    loginHref={loginHref}
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
              loginHref={loginHref}
              inline
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
