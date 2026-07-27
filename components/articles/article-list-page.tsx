import {
  ArticleCard,
  articleCardDate,
  type ArticleCardData,
} from "@/components/articles/article-card"
import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { Card, CardContent } from "@/components/ui/card"
import { UrlSelectFilter } from "@/components/url-select-filter"
import {
  getArticleCategories,
  getArticles,
  type ArticleListItem,
} from "@/lib/articles"

type SearchParams = Record<string, string | string[] | undefined>

export function articleListCard(
  article: ArticleListItem,
  hrefPrefix = "/artikel"
): ArticleCardData {
  return {
    title: article.title,
    category: article.category,
    excerpt: article.excerpt,
    date: articleCardDate(article.publishedAt),
    image: article.coverImageUrl || "/landing-carousel/apoteker1.png",
    href: `${hrefPrefix}/${article.slug}`,
  }
}

export async function ArticleListPage({
  action,
  eyebrow,
  searchParams,
  title = "Artikel",
  detailHrefPrefix = "/artikel",
}: {
  action: string
  eyebrow: string
  searchParams?: Promise<SearchParams>
  title?: string
  detailHrefPrefix?: string
}) {
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
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
        </div>
        <div className="grid max-w-3xl gap-3 md:grid-cols-[1fr_220px]">
          <DebouncedSearchInput
            action={action}
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
            <ArticleCard
              key={article.id}
              article={articleListCard(article, detailHrefPrefix)}
            />
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
  )
}
