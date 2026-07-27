import { notFound } from "next/navigation"

import { VideoDetailView } from "@/components/videos/video-detail"
import { getPublishedVideoBySlug } from "@/lib/educational-videos"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function DashboardVideoDetailPage({ params }: PageProps) {
  const { slug } = await params
  const video = await getPublishedVideoBySlug(slug)
  if (!video) notFound()

  return (
    <div className="px-4 py-4 md:px-6 md:py-8">
      <VideoDetailView
        video={video}
        backHref="/dashboard/video"
        backLabel="Kembali ke Video"
      />
    </div>
  )
}
