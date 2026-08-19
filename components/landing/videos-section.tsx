import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LandingHighlightTitle } from "@/components/landing/landing-highlight-title"
import { VideoCard, type VideoCardData } from "@/components/videos/video-card"
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
    <section className="relative overflow-hidden bg-secondary px-6 pt-28 pb-16 md:pt-44 md:pb-20 lg:pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      <div
        aria-hidden="true"
        className="animate-landing-neon-glow absolute -left-28 top-8 h-72 w-[34rem] rounded-[70%_30%_58%_42%/44%_62%_38%_56%] bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.2)_0%,rgba(234,179,8,0.1)_42%,transparent_72%)] blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 md:gap-5">
        <LandingHighlightTitle className="self-start">
          Video Edukasi
        </LandingHighlightTitle>

        <div className="grid w-full max-w-4xl gap-5 md:self-start">
          {videos.map((video) => (
            <VideoCard key={video.title} video={video} />
          ))}
        </div>

        <Button
          asChild
          className="rounded-full border-0 bg-white text-foreground shadow-[0_0_24px_-20px_rgba(234,179,8,0.48)] hover:bg-white/90"
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
