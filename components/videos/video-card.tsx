import Link from "next/link"
import { PlayCircleIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type VideoCardData = {
  title: string
  category: string
  excerpt: string
  thumbnailUrl: string
  href: string
}

export function VideoCard({
  video,
  className,
}: {
  video: VideoCardData
  className?: string
}) {
  return (
    <article>
      <Card
        className={cn(
          "grid grid-cols-[5.75rem_minmax(0,1fr)] items-center gap-4 rounded-[1.75rem] border-0 bg-white p-3 py-3 shadow-none ring-0 transition-colors hover:bg-white/80 hover:shadow-none sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:p-4 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-6 md:p-5",
          className
        )}
      >
        <Link
          href={video.href}
          className="group relative block aspect-square w-full shrink-0 overflow-hidden rounded-[1.25rem] bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
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
            <span className="flex size-10 items-center justify-center rounded-full bg-background/90 text-primary backdrop-blur">
              <PlayCircleIcon aria-hidden="true" />
            </span>
          </span>
        </Link>

        <div className="flex min-w-0 flex-col gap-2 py-1">
          <CardHeader className="gap-1 px-0">
            <span className="w-fit max-w-full truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {video.category}
            </span>
            <CardTitle className="line-clamp-2 text-base leading-snug font-semibold tracking-tight text-secondary-foreground md:text-2xl">
              {video.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <p className="line-clamp-2 text-sm leading-5 text-muted-foreground md:leading-6">
              {video.excerpt}
            </p>
          </CardContent>
          <CardFooter className="px-0 pt-0">
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
