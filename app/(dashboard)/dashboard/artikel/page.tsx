import { ArticleListPage } from "@/components/articles/article-list-page"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Artikel | Medisigna",
}

export default function DashboardArticlesPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-[calc(100dvh-7rem)] rounded-[2rem] bg-secondary py-4 md:rounded-[2.25rem] md:py-6">
      <div className="mx-auto flex max-w-6xl flex-col">
        <ArticleListPage
          action="/dashboard/artikel"
          detailHrefPrefix="/dashboard/artikel"
          eyebrow="Edukasi"
          searchParams={searchParams}
          variant="soft"
        />
      </div>
    </main>
  )
}
