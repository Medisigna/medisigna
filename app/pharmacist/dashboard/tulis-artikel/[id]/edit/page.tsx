import { notFound } from "next/navigation"

import { savePharmacistArticle } from "@/app/actions/pharmacist/save-article"
import { AppMessage } from "@/components/app-message"
import { ArticleForm } from "@/components/articles/article-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getArticleById } from "@/lib/articles"
import { getCategoryNamesForForm } from "@/lib/content-categories"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditPharmacistArticlePage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireRole("PHARMACIST"),
  ])
  const article = await getArticleById(id)
  if (!article || article.authorId !== user.id || article.status !== "REJECTED") notFound()
  const categories = await getCategoryNamesForForm(article.category)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <AppMessage error={query?.error} success={query?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Tulis Artikel</p>
        <h1 className="text-2xl font-semibold">Perbaiki Artikel</h1>
      </header>
      {article.adminNote ? (
        <Card className="rounded-[1.75rem] border-0 bg-card shadow-none ring-0">
          <CardHeader>
            <CardTitle>Catatan admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{article.adminNote}</p>
          </CardContent>
        </Card>
      ) : null}
      <ArticleForm
        article={article}
        saveAction={savePharmacistArticle}
        cancelHref={`/pharmacist/dashboard/tulis-artikel/${article.id}`}
        categories={categories}
      />
    </main>
  )
}
