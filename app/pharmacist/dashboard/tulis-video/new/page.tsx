import { savePharmacistVideo } from "@/app/actions/pharmacist/save-video"
import { AppMessage } from "@/components/app-message"
import { VideoForm } from "@/components/videos/video-form"
import { getCategoryNamesForForm } from "@/lib/content-categories"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewPharmacistVideoPage({ searchParams }: PageProps) {
  const [params, categories] = await Promise.all([
    searchParams,
    getCategoryNamesForForm(),
  ])

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <AppMessage error={params?.error} success={params?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Tulis Video</p>
        <h1 className="text-2xl font-semibold">Tambah Video</h1>
      </header>
      <VideoForm
        saveAction={savePharmacistVideo}
        cancelHref="/pharmacist/dashboard/tulis-video"
        categories={categories}
      />
    </main>
  )
}
