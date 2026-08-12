import { ArticleListPage } from "@/components/articles/article-list-page"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Artikel | Medisigna",
  description: "Artikel edukasi obat dari apoteker terverifikasi Medisigna.",
}

export default function ArticlesPage({ searchParams }: PageProps) {
  return (
    <main className="flex min-h-svh flex-col bg-secondary">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:py-12">
        <ArticleListPage
          action="/artikel"
          eyebrow="Medisigna"
          searchParams={searchParams}
          variant="soft"
        />
      </div>
      <SiteFooter />
    </main>
  )
}
