import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { MarkdownPreview } from "@/components/markdown-preview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ArticleDetail } from "@/lib/articles"

function formatDate(date: Date | null) {
  if (!date) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Makassar",
  }).format(date)
}

export function ArticleDetailView({
  article,
  backHref,
  backLabel = "Kembali",
}: {
  article: ArticleDetail
  backHref: string
  backLabel?: string
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link href={backHref}>
          <ArrowLeftIcon data-icon="inline-start" />
          {backLabel}
        </Link>
      </Button>

      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <span className="w-fit rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {article.category}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {article.title}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">{article.excerpt}</p>
          <p className="text-sm text-muted-foreground">
            {article.authorTitle ? `${article.authorName}, ${article.authorTitle}` : article.authorName} ·{" "}
            {formatDate(article.publishedAt ?? article.reviewedAt ?? article.updatedAt)}
          </p>
        </header>

        {article.coverImageUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="size-full object-cover"
            />
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Isi artikel</CardTitle>
          </CardHeader>
          <CardContent className="leading-7 text-muted-foreground">
            <MarkdownPreview source={article.contentMarkdown} />
          </CardContent>
        </Card>
      </article>
    </div>
  )
}
