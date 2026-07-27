import { savePharmacistArticle } from "@/app/actions/pharmacist/save-article"
import { ArticleForm } from "@/components/articles/article-form"
import { AppMessage } from "@/components/app-message"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewPharmacistArticlePage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Tulis Artikel</p>
        <h1 className="text-2xl font-semibold">Tambah Artikel</h1>
      </header>
      <ArticleForm
        saveAction={savePharmacistArticle}
        cancelHref="/pharmacist/dashboard/tulis-artikel"
      />
    </main>
  )
}
