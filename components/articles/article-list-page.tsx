import {
  ArticleCard,
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
import { cn } from "@/lib/utils"

type SearchParams = Record<string, string | string[] | undefined>

function formatArticleDate(date: Date | null) {
  if (!date) return undefined

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(date)
}

export function articleListCard(
  article: ArticleListItem,
  hrefPrefix = "/artikel"
): ArticleCardData {
  return {
    title: article.title,
    category: article.category,
    dateLabel: formatArticleDate(
      article.publishedAt ?? article.reviewedAt ?? article.updatedAt
    ),
    excerpt: article.excerpt,
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
  variant = "default",
}: {
  action: string
  eyebrow: string
  searchParams?: Promise<SearchParams>
  title?: string
  detailHrefPrefix?: string
  variant?: "default" | "soft"
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
  const isSoft = variant === "soft"

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-secondary-foreground md:text-3xl">
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
            inputGroupClassName={cn(
              "h-11 rounded-2xl",
              isSoft
                ? "border-0 bg-card shadow-none ring-0"
                : "bg-background shadow-sm"
            )}
          />
          <UrlSelectFilter
            ariaLabel="Filter kategori"
            className={cn(
              isSoft && "rounded-2xl border-0 bg-card shadow-none ring-0"
            )}
            labels={categoryLabels}
            options={categoryOptions}
            paramName="category"
            value={category || "ALL"}
          />
        </div>
      </header>

      {result.articles.length ? (
        <section className="grid max-w-4xl gap-5">
          {result.articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={articleListCard(article, detailHrefPrefix)}
              className={cn(
                isSoft &&
                  "rounded-[1.75rem] border-0 bg-card shadow-none ring-0 hover:shadow-none"
              )}
            />
          ))}
        </section>
      ) : (
        <Card
          className={cn(
            isSoft &&
              "rounded-[1.75rem] border border-dashed border-border/70 bg-card shadow-none ring-0"
          )}
        >
          <CardContent className="py-10 text-center text-muted-foreground">
            Artikel tidak ditemukan.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
