import Link from "next/link"
import { notFound } from "next/navigation"
import { PencilIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { ArticleDetailView } from "@/components/articles/article-detail"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { articleStatusLabels, getArticleById, type ArticleStatus } from "@/lib/articles"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function PharmacistArticlePreviewPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireRole("PHARMACIST"),
  ])
  const article = await getArticleById(id)
  if (!article || article.authorId !== user.id) notFound()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <AppMessage error={query?.error} success={query?.success} />
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <CardTitle>{articleStatusLabels[article.status as ArticleStatus]}</CardTitle>
          </div>
          {article.status === "REJECTED" ? (
            <Button asChild variant="outline">
              <Link href={`/pharmacist/dashboard/tulis-artikel/${article.id}/edit`}>
                <PencilIcon data-icon="inline-start" />
                Perbaiki
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        {article.adminNote ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">{article.adminNote}</p>
          </CardContent>
        ) : null}
      </Card>
      <ArticleDetailView
        article={article}
        backHref="/pharmacist/dashboard/tulis-artikel"
        backLabel="Kembali ke Tulis Artikel"
      />
    </main>
  )
}
