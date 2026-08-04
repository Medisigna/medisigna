import { notFound } from "next/navigation"

import { savePharmacistVideo } from "@/app/actions/pharmacist/save-video"
import { AppMessage } from "@/components/app-message"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoForm } from "@/components/videos/video-form"
import { getCategoryNamesForForm } from "@/lib/content-categories"
import { getVideoById } from "@/lib/educational-videos"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditPharmacistVideoPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireRole("PHARMACIST"),
  ])
  const video = await getVideoById(id)
  if (!video || video.authorId !== user.id || video.status !== "REJECTED") notFound()
  const categories = await getCategoryNamesForForm(video.category)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <AppMessage error={query?.error} success={query?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Tulis Video</p>
        <h1 className="text-2xl font-semibold">Perbaiki Video</h1>
      </header>
      {video.adminNote ? (
        <Card className="rounded-[1.75rem] border-0 bg-card shadow-none ring-0">
          <CardHeader>
            <CardTitle>Catatan admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{video.adminNote}</p>
          </CardContent>
        </Card>
      ) : null}
      <VideoForm
        video={video}
        saveAction={savePharmacistVideo}
        cancelHref={`/pharmacist/dashboard/tulis-video/${video.id}`}
        categories={categories}
      />
    </main>
  )
}
