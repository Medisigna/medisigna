import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import {
  ArticleCard,
  type ArticleCardData,
} from "@/components/articles/article-card"
import { LandingHighlightTitle } from "@/components/landing/landing-highlight-title"
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
    <section className="relative overflow-hidden bg-secondary px-6 pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      <div
        aria-hidden="true"
        className="animate-landing-neon-glow absolute -left-32 top-0 h-80 w-[34rem] rounded-[58%_42%_66%_34%/42%_58%_42%_58%] bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.16)_0%,rgba(125,211,252,0.1)_44%,transparent_74%)] blur-3xl [animation-delay:0.9s]"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 md:gap-5">
        <LandingHighlightTitle className="self-start">
          Artikel
        </LandingHighlightTitle>

        <div className="grid w-full max-w-4xl gap-5 md:self-start">
          {articles.map((article) => (
            <ArticleCard key={article.title} article={article} />
          ))}
        </div>

        <Button
          asChild
          className="rounded-full border-0 bg-white text-foreground shadow-[0_0_24px_-20px_rgba(52,211,153,0.42)] hover:bg-white/90"
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
