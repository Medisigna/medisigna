import { notFound } from "next/navigation"

import { ArticleDetailView } from "@/components/articles/article-detail"
import { getPublishedArticleBySlug } from "@/lib/articles"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function DashboardArticleDetailPage({
  params,
}: PageProps) {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) notFound()

  return (
    <div className="px-4 py-4 md:px-6 md:py-8">
      <ArticleDetailView
        article={article}
        backHref="/dashboard/artikel"
        backLabel="Kembali ke Artikel"
      />
    </div>
  )
}
