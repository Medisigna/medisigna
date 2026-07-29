import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { Card, CardContent } from "@/components/ui/card"
import { UrlSelectFilter } from "@/components/url-select-filter"
import {
  VideoCard,
  type VideoCardData,
} from "@/components/videos/video-card"
import {
  getVideoCategories,
  getVideos,
  type VideoListItem,
  youtubeThumbnailUrl,
} from "@/lib/educational-videos"

type SearchParams = Record<string, string | string[] | undefined>

export function videoListCard(
  video: VideoListItem,
  hrefPrefix = "/video"
): VideoCardData {
  return {
    title: video.title,
    category: video.category,
    excerpt: video.excerpt,
    thumbnailUrl: youtubeThumbnailUrl(video.youtubeVideoId),
    href: `${hrefPrefix}/${video.slug}`,
  }
}

export async function VideoListPage({
  action,
  eyebrow,
  searchParams,
  title = "Video Edukasi",
  detailHrefPrefix = "/video",
}: {
  action: string
  eyebrow: string
  searchParams?: Promise<SearchParams>
  title?: string
  detailHrefPrefix?: string
}) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const category =
    typeof params?.category === "string" ? params.category.trim() : ""
  const [result, categories] = await Promise.all([
    getVideos({ query, category, publishedOnly: true }),
    getVideoCategories({ publishedOnly: true }),
  ])
  const categoryOptions = ["ALL", ...categories]
  const categoryLabels: Record<string, string> = Object.fromEntries([
    ["ALL", "Semua kategori"],
    ...categories.map((item: string) => [item, item]),
  ])

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
        </div>
        <div className="grid max-w-3xl gap-3 md:grid-cols-[1fr_220px]">
          <DebouncedSearchInput
            action={action}
            query={query}
            placeholder="Cari video atau kategori"
            ariaLabel="Cari video"
            hiddenParams={{ category: category || undefined }}
            inputGroupClassName="h-11 bg-background shadow-sm"
          />
          <UrlSelectFilter
            ariaLabel="Filter kategori"
            labels={categoryLabels}
            options={categoryOptions}
            paramName="category"
            value={category || "ALL"}
          />
        </div>
      </header>

      {result.videos.length ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {result.videos.map((video) => (
            <VideoCard
              key={video.id}
              video={videoListCard(video, detailHrefPrefix)}
            />
          ))}
        </section>
      ) : (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Video tidak ditemukan.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
