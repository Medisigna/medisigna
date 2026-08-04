import Link from "next/link"

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type ArticleCardData = {
  title: string
  category: string
  dateLabel?: string
  excerpt: string
  image: string
  href: string
}

export function ArticleCard({
  article,
  className,
}: {
  article: ArticleCardData
  className?: string
}) {
  return (
    <article>
      <Card
        className={cn(
          "grid grid-cols-[5.75rem_minmax(0,1fr)] items-center gap-4 rounded-[1.75rem] bg-card p-3 py-3 shadow-none ring-0 transition-colors hover:bg-card/80 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:p-4",
          className
        )}
      >
        <Link
          href={article.href}
          className="relative block aspect-square w-full shrink-0 overflow-hidden rounded-[1.25rem] bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`Baca ${article.title}`}
        >
          <img
            src={article.image}
            alt={article.title}
            className="size-full object-cover"
          />
        </Link>

        <div className="flex min-w-0 flex-col gap-2 py-1">
          <CardHeader className="gap-1 px-0">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {article.dateLabel ? (
                <span className="truncate text-xs font-medium text-muted-foreground">
                  {article.dateLabel}
                </span>
              ) : null}
              <span className="max-w-full truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {article.category}
              </span>
            </div>
            <Link
              href={article.href}
              className="focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <CardTitle className="line-clamp-2 text-base leading-snug font-semibold tracking-tight text-secondary-foreground">
                {article.title}
              </CardTitle>
            </Link>
          </CardHeader>
          <CardFooter className="px-0 pt-0">
            <Link
              href={article.href}
              className="inline-flex w-fit text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Baca Artikel
            </Link>
          </CardFooter>
        </div>
      </Card>
    </article>
  )
}
