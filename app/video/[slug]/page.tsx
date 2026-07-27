import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { VideoDetailView } from "@/components/videos/video-detail"
import { getPublishedVideoBySlug, youtubeThumbnailUrl } from "@/lib/educational-videos"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const video = await getPublishedVideoBySlug(slug)
  if (!video) return { title: "Video Tidak Ditemukan | Medisigna" }

  return {
    title: video.metaTitle || `${video.title} | Medisigna`,
    description: video.metaDescription || video.excerpt,
    openGraph: {
      images: [youtubeThumbnailUrl(video.youtubeVideoId)],
    },
  }
}

export default async function PublicVideoDetailPage({ params }: PageProps) {
  const { slug } = await params
  const video = await getPublishedVideoBySlug(slug)
  if (!video) notFound()

  return (
    <main className="flex min-h-svh flex-col bg-muted-foreground/5">
      <SiteHeader />
      <div className="flex-1 px-4 py-8 md:px-6 md:py-12">
        <VideoDetailView
          video={video}
          backHref="/video"
          backLabel="Kembali ke Video"
        />
      </div>
      <SiteFooter />
    </main>
  )
}
