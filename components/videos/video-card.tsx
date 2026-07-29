import Link from "next/link"
import { PlayCircleIcon } from "lucide-react"

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
  thumbnailUrl: string
  href: string
}

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <article>
      <Card className="grid gap-0 py-0 transition-shadow hover:shadow-md sm:grid-cols-[13rem_minmax(0,1fr)]">
        <Link
          href={video.href}
          className="group relative aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:h-56"
          aria-label={`Tonton ${video.title}`}
        >
          <img
            src={video.thumbnailUrl}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm backdrop-blur">
              <PlayCircleIcon aria-hidden="true" />
            </span>
          </span>
        </Link>

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
