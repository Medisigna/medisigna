import { VideoListPage } from "@/components/videos/video-list-page"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Video Kesehatan | Medisigna",
}

export default function DashboardVideosPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-4 md:px-6 md:py-8">
      <VideoListPage
        action="/dashboard/video"
        detailHrefPrefix="/dashboard/video"
        eyebrow="Edukasi"
        searchParams={searchParams}
        title="Video Kesehatan"
      />
    </div>
  )
}
