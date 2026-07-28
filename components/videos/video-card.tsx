import Link from "next/link"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type VideoCardData = {
  title: string
  category: string
  excerpt: string
  embedUrl: string
  href: string
}

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <article>
      <Card className="grid gap-0 py-0 transition-shadow hover:shadow-md sm:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-56">
          <iframe
            src={video.embedUrl}
            title={video.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full"
          />
        </div>

        <div className="flex min-w-0 flex-col py-4 md:py-5">
          <CardHeader>
            <span className="w-fit rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {video.category}
            </span>
            <CardTitle className="line-clamp-2 text-lg font-semibold tracking-tight md:text-xl">
              {video.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 md:pt-3">
            <p className="line-clamp-2 text-sm leading-5 text-muted-foreground md:leading-6">
              {video.excerpt}
            </p>
          </CardContent>
          <CardFooter className="mt-auto pt-3 md:pt-4">
            <Link
              href={video.href}
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Tonton video
            </Link>
          </CardFooter>
        </div>
      </Card>
    </article>
  )
}
