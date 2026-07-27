import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { VideoListPage } from "@/components/videos/video-list-page"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Video Edukasi | Medisigna",
  description: "Video edukasi obat dari apoteker terverifikasi Medisigna.",
}

export default function VideosPage({ searchParams }: PageProps) {
  return (
    <main className="flex min-h-svh flex-col bg-muted-foreground/5">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 md:py-12">
        <VideoListPage
          action="/video"
          eyebrow="Medisigna"
          searchParams={searchParams}
        />
      </div>
      <SiteFooter />
    </main>
  )
}
