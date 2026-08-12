import Link from "next/link"
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
} from "lucide-react"

import { ForumBadge } from "@/components/forum/forum-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getForumThreads, forumAuthorName } from "@/lib/forum"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Makassar",
  }).format(date)
}

export async function ForumSection() {
  const { threads } = await getForumThreads({ limit: 3 })

  return (
    <section className="bg-secondary px-6 py-12 md:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-sm font-medium text-primary">Forum Diskusi</p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-5xl">
              Tanya jawab obat bersama komunitas.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="rounded-full bg-card">
              <Link href="/forum/new">
                <MessageSquarePlusIcon data-icon="inline-start" />
                Buat Diskusi
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              <Link href="/forum">
                Lihat Forum
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>

        {threads.length ? (
          <div className="grid gap-2 lg:grid-cols-3">
            {threads.map((thread) => {
              const authorName = forumAuthorName({
                authorName: thread.authorName,
                authorRole: thread.authorRole,
              })
              const replyCount = Math.max(thread.postCount - 1, 0)

              return (
                <Card
                  key={thread.id}
                  className="rounded-[1.75rem] border-0 bg-card py-0 shadow-none ring-0 transition-colors hover:bg-card/80"
                >
                  <CardContent className="flex h-full flex-col gap-2 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <ForumBadge tone="category">
                        {thread.categoryName}
                      </ForumBadge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDate(thread.lastPostAt)}
                      </span>
                    </div>
                    <Link
                      href={`/forum/${thread.slug}`}
                      className="line-clamp-3 text-lg leading-snug font-semibold tracking-tight text-foreground hover:text-primary"
                    >
                      {thread.title}
                    </Link>
                    <div className="mt-auto flex items-center justify-between gap-3 text-sm text-muted-foreground">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate">{authorName}</span>
                        {thread.authorRole === "PHARMACIST" ? (
                          <BadgeCheckIcon
                            className="size-3.5 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5">
                        <MessageSquareTextIcon aria-hidden="true" />
                        {replyCount}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="rounded-[1.75rem] border-0 bg-card shadow-none ring-0">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Belum ada diskusi.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
