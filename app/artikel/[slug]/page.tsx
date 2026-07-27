import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleDetailView } from "@/components/articles/article-detail"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { getPublishedArticleBySlug } from "@/lib/articles"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) return { title: "Artikel Tidak Ditemukan | Medisigna" }

  return {
    title: article.metaTitle || `${article.title} | Medisigna`,
    description: article.metaDescription || article.excerpt,
  }
}

export default async function PublicArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getPublishedArticleBySlug(slug)
  if (!article) notFound()

  return (
    <main className="flex min-h-svh flex-col bg-muted-foreground/5">
      <SiteHeader />
      <div className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <ArticleDetailView
          article={article}
          backHref="/artikel"
          backLabel="Kembali ke Artikel"
        />
      </div>
      <SiteFooter />
    </main>
  )
}
