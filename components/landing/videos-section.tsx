import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  VideoCard,
  type VideoCardData,
} from "@/components/videos/video-card"
import {
  getVideos,
  type VideoListItem,
  youtubeThumbnailUrl,
} from "@/lib/educational-videos"

const fallbackVideos: VideoCardData[] = [
  {
    title: "Membaca Aturan Pakai Obat",
    category: "Edukasi Obat",
    excerpt:
      "Pahami dosis, frekuensi, dan waktu minum obat agar terapi berjalan aman.",
    thumbnailUrl: youtubeThumbnailUrl("dFhhLtAkP0E"),
    href: "/video",
  },
  {
    title: "Kapan Perlu Konsultasi Apoteker?",
    category: "Konsultasi",
    excerpt:
      "Kenali kondisi yang perlu ditanyakan sebelum memakai atau mengganti obat.",
    thumbnailUrl: youtubeThumbnailUrl("dFhhLtAkP0E"),
    href: "/video",
  },
]

function videoCards(videos: VideoListItem[]) {
  if (!videos.length) return fallbackVideos

  return videos.map((video) => ({
    title: video.title,
    category: video.category,
    excerpt: video.excerpt,
    thumbnailUrl: youtubeThumbnailUrl(video.youtubeVideoId),
    href: `/video/${video.slug}`,
  }))
}

export async function VideosSection() {
  const result = await getVideos({ publishedOnly: true, limit: 2 })
  const videos = videoCards(result.videos)

  return (
    <section className="bg-background px-6 pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-52">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:gap-10">
        <h2 className="max-w-3xl text-center text-2xl font-semibold tracking-tight text-foreground md:text-5xl">
          Tonton{" "}
          <span className="text-primary">Video Populer</span>
        </h2>

        <div className="mt-4 grid w-full gap-5 md:mt-6 lg:grid-cols-2">
          {videos.map((video) => (
            <VideoCard key={video.title} video={video} />
          ))}
        </div>

        <Button
          asChild
          className="rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
          <Link href="/video">
            Lihat Semua Video
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
