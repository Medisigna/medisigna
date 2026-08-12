import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import {
  ArticleCard,
  type ArticleCardData,
} from "@/components/articles/article-card"
import { Button } from "@/components/ui/button"
import { getArticles, type ArticleListItem } from "@/lib/articles"

const fallbackArticles: ArticleCardData[] = [
  {
    title: "Cara Aman Menggunakan Obat Bebas di Rumah",
    category: "Edukasi Obat",
    excerpt:
      "Kenali aturan pakai, dosis, dan tanda bahaya sebelum memilih obat tanpa resep.",
    image: "/landing-carousel/apoteker1.png",
    href: "/artikel",
  },
  {
    title: "Kapan Harus Bertanya ke Apoteker?",
    category: "Konsultasi",
    excerpt:
      "Beberapa keluhan terlihat ringan, tetapi tetap perlu arahan agar terapi lebih aman.",
    image: "/landing-carousel/apoteker2.png",
    href: "/artikel",
  },
]

function formatArticleDate(date: Date | null) {
  if (!date) return undefined

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function articleCards(articles: ArticleListItem[]) {
  if (!articles.length) return fallbackArticles

  return articles.map((article) => ({
    title: article.title,
    category: article.category,
    dateLabel: formatArticleDate(
      article.publishedAt ?? article.reviewedAt ?? article.updatedAt
    ),
    excerpt: article.excerpt,
    image: article.coverImageUrl || "/landing-carousel/apoteker1.png",
    href: `/artikel/${article.slug}`,
  }))
}

export async function ArticlesSection() {
  const result = await getArticles({ publishedOnly: true, limit: 2 })
  const articles = articleCards(result.articles)

  return (
    <section className="bg-secondary px-6 pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:gap-5">
        <h2 className="max-w-3xl self-start text-left text-2xl font-semibold tracking-tight text-foreground md:text-5xl">
          Artikel
        </h2>

        <div className="grid w-full max-w-4xl gap-5 md:self-start">
          {articles.map((article) => (
            <ArticleCard key={article.title} article={article} />
          ))}
        </div>

        <Button
          asChild
          className="rounded-full border-0 bg-white text-foreground shadow-none hover:bg-white/90"
        >
          <Link href="/artikel">
            Lihat Semua Artikel
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
