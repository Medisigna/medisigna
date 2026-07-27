import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { youtubeEmbedUrl, type VideoDetail } from "@/lib/educational-videos"

function formatDate(date: Date | null) {
  if (!date) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Makassar",
  }).format(date)
}

export function VideoDetailView({
  backHref,
  backLabel = "Kembali",
  video,
}: {
  backHref: string
  backLabel?: string
  video: VideoDetail
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link href={backHref}>
          <ArrowLeftIcon data-icon="inline-start" />
          {backLabel}
        </Link>
      </Button>

      <article className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <span className="w-fit rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {video.category}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {video.title}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">{video.excerpt}</p>
          <p className="text-sm text-muted-foreground">
            {video.authorTitle ? `${video.authorName}, ${video.authorTitle}` : video.authorName} -{" "}
            {formatDate(video.publishedAt ?? video.reviewedAt ?? video.updatedAt)}
          </p>
        </header>

        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          <iframe
            src={youtubeEmbedUrl(video.youtubeVideoId)}
            title={video.title}
            className="size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan</CardTitle>
          </CardHeader>
          <CardContent className="leading-7 text-muted-foreground">
            <p>{video.excerpt}</p>
          </CardContent>
        </Card>
      </article>
    </div>
  )
}
