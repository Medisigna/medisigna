import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { moderateForum } from "@/app/actions/admin/moderate-forum"
import { ForumBadge } from "@/components/forum/forum-badge"
import { MarkdownPreview } from "@/components/markdown-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { forumThreadStatusLabels, getForumThreadBySlug } from "@/lib/forum"
import type { ForumPostAttachmentItem } from "@/lib/forum"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ slug: string }>
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function ForumAttachmentGallery({ attachments }: { attachments: ForumPostAttachmentItem[] }) {
  const gallery = attachments.filter((attachment) => !attachment.isInline)
  if (!gallery.length) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {gallery.map((attachment) => (
        <figure key={attachment.id} className="overflow-hidden rounded-md border bg-muted/20">
          <img
            src={attachment.fileUrl}
            alt={attachment.altText ?? attachment.fileName}
            className="aspect-video w-full object-cover"
          />
        </figure>
      ))}
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const thread = await getForumThreadBySlug({ slug, includeHidden: true })

  return {
    title: thread ? `${thread.title} | Moderasi Forum` : "Moderasi Forum",
  }
}

export default async function AdminForumThreadPage({ params }: PageProps) {
  await requireRole("ADMIN")
  const { slug } = await params
  const thread = await getForumThreadBySlug({ slug, includeHidden: true })

  if (!thread) notFound()

  return (
    <main className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/admin/forum">
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ForumBadge>{thread.categoryName}</ForumBadge>
            <ForumBadge tone={thread.status === "HIDDEN" ? "danger" : "muted"}>
              {forumThreadStatusLabels[thread.status]}
            </ForumBadge>
            {thread.isPinned ? <ForumBadge tone="primary">Pin</ForumBadge> : null}
          </div>
          <CardTitle className="text-2xl tracking-tight">{thread.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {thread.postCount} post · terakhir {formatDate(thread.lastPostAt)}
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <form action={moderateForum}>
              <input type="hidden" name="targetType" value="THREAD" />
              <input type="hidden" name="id" value={thread.id} />
              <input type="hidden" name="action" value={thread.isPinned ? "unpin" : "pin"} />
              <Button type="submit" variant="outline">
                {thread.isPinned ? "Unpin" : "Pin"}
              </Button>
            </form>
            <form action={moderateForum}>
              <input type="hidden" name="targetType" value="THREAD" />
              <input type="hidden" name="id" value={thread.id} />
              <input type="hidden" name="action" value={thread.status === "LOCKED" ? "unlock" : "lock"} />
              <Button type="submit" variant="outline">
                {thread.status === "LOCKED" ? "Buka lock" : "Kunci"}
              </Button>
            </form>
            {thread.status === "HIDDEN" ? (
              <form action={moderateForum}>
                <input type="hidden" name="targetType" value="THREAD" />
                <input type="hidden" name="id" value={thread.id} />
                <input type="hidden" name="action" value="restore" />
                <Button type="submit">Restore thread</Button>
              </form>
            ) : null}
          </div>
          {thread.status !== "HIDDEN" ? (
            <form action={moderateForum} className="flex max-w-xl gap-2">
              <input type="hidden" name="targetType" value="THREAD" />
              <input type="hidden" name="id" value={thread.id} />
              <input type="hidden" name="action" value="hide" />
              <Input name="reason" placeholder="Alasan hide thread" required />
              <Button type="submit" variant="destructive">Hide</Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {thread.posts.map((post) => (
          <Card key={post.id} className={post.status === "HIDDEN" ? "opacity-70" : ""}>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-base">{post.authorName}</CardTitle>
                <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ForumBadge tone={post.status === "HIDDEN" ? "danger" : "muted"}>
                  {post.status === "HIDDEN" ? "Disembunyikan" : "Visible"}
                </ForumBadge>
                {post.status === "HIDDEN" ? (
                  <form action={moderateForum}>
                    <input type="hidden" name="targetType" value="POST" />
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="action" value="restore" />
                    <Button type="submit" size="sm">Restore</Button>
                  </form>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {post.status === "HIDDEN" ? (
                <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  Alasan: {post.hiddenReason || "-"}
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {post.bodyMarkdown ? <MarkdownPreview source={post.bodyMarkdown} /> : null}
                  <ForumAttachmentGallery attachments={post.attachments} />
                </div>
              )}
              {post.status !== "HIDDEN" ? (
                <form action={moderateForum} className="flex max-w-xl gap-2">
                  <input type="hidden" name="targetType" value="POST" />
                  <input type="hidden" name="id" value={post.id} />
                  <input type="hidden" name="action" value="hide" />
                  <Input name="reason" placeholder="Alasan hide post" required />
                  <Button type="submit" variant="destructive">Hide post</Button>
                </form>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
