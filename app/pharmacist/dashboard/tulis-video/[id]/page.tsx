import Link from "next/link"
import { notFound } from "next/navigation"
import { PencilIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoDetailView } from "@/components/videos/video-detail"
import { getVideoById, videoStatusLabels, type VideoStatus } from "@/lib/educational-videos"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function PharmacistVideoPreviewPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireRole("PHARMACIST"),
  ])
  const video = await getVideoById(id)
  if (!video || video.authorId !== user.id) notFound()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <AppMessage error={query?.error} success={query?.success} />
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <CardTitle>{videoStatusLabels[video.status as VideoStatus]}</CardTitle>
          </div>
          {video.status === "REJECTED" ? (
            <Button asChild variant="outline">
              <Link href={`/pharmacist/dashboard/tulis-video/${video.id}/edit`}>
                <PencilIcon data-icon="inline-start" />
                Perbaiki
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        {video.adminNote ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">{video.adminNote}</p>
          </CardContent>
        ) : null}
      </Card>
      <VideoDetailView
        video={video}
        backHref="/pharmacist/dashboard/tulis-video"
        backLabel="Kembali ke Tulis Video"
      />
    </main>
  )
}
