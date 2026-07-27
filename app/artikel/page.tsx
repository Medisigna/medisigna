import {
  ArticleCard,
  articleCardDate,
  type ArticleCardData,
} from "@/components/articles/article-card"
import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Card, CardContent } from "@/components/ui/card"
import { UrlSelectFilter } from "@/components/url-select-filter"
import {
  getArticleCategories,
  getArticles,
  type ArticleListItem,
} from "@/lib/articles"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function articleCard(article: ArticleListItem): ArticleCardData {
  return {
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    date: articleCardDate(article.publishedAt),
    image: article.coverImageUrl || "/landing-carousel/apoteker1.png",
    href: `/artikel/${article.slug}`,
  }
}

export const metadata = {
  title: "Artikel | Medisigna",
  description: "Artikel edukasi obat dari apoteker terverifikasi Medisigna.",
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const category =
    typeof params?.category === "string" ? params.category.trim() : ""
  const [result, categories] = await Promise.all([
    getArticles({ query, category, publishedOnly: true }),
    getArticleCategories({ publishedOnly: true }),
  ])
  const categoryOptions = ["ALL", ...categories]
  const categoryLabels: Record<string, string> = Object.fromEntries([
    ["ALL", "Semua kategori"],
    ...categories.map((item: string) => [item, item]),
  ])

  return (
    <main className="flex min-h-svh flex-col bg-muted-foreground/5">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:py-12">
        <header className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-primary">Medisigna</p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Artikel
            </h1>
          </div>
          <div className="grid max-w-3xl gap-3 md:grid-cols-[1fr_220px]">
            <DebouncedSearchInput
              action="/artikel"
              query={query}
              placeholder="Cari artikel atau kategori"
              ariaLabel="Cari artikel"
              hiddenParams={{ category: category || undefined }}
              inputGroupClassName="h-11 bg-background shadow-sm"
            />
            <UrlSelectFilter
              ariaLabel="Filter kategori"
              labels={categoryLabels}
              options={categoryOptions}
              paramName="category"
              value={category || "ALL"}
            />
          </div>
        </header>

        {result.articles.length ? (
          <section className="grid gap-5 lg:grid-cols-2">
            {result.articles.map((article) => (
              <ArticleCard key={article.id} article={articleCard(article)} />
            ))}
          </section>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Artikel tidak ditemukan.
            </CardContent>
          </Card>
        )}
      </div>
      <SiteFooter />
    </main>
  )
}
