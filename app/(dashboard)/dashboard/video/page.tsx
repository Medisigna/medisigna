import { VideoListPage } from "@/components/videos/video-list-page"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Video Kesehatan | Medisigna",
}

export default function DashboardVideosPage({ searchParams }: PageProps) {
  return (
    <main className="min-h-[calc(100dvh-7rem)] rounded-[2rem] bg-secondary py-4 md:rounded-[2.25rem] md:py-6">
      <div className="mx-auto flex max-w-6xl flex-col">
        <VideoListPage
          action="/dashboard/video"
          detailHrefPrefix="/dashboard/video"
          eyebrow="Edukasi"
          searchParams={searchParams}
          title="Video Kesehatan"
          variant="soft"
        />
      </div>
    </main>
  )
}
