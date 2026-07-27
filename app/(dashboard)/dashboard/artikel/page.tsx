import { ArticleListPage } from "@/components/articles/article-list-page"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Artikel | Medisigna",
}

export default function DashboardArticlesPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-4 md:px-6 md:py-8">
      <ArticleListPage
        action="/dashboard/artikel"
        detailHrefPrefix="/dashboard/artikel"
        eyebrow="Edukasi"
        searchParams={searchParams}
      />
    </div>
  )
}
