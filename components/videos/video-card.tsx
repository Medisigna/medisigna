import Link from "next/link"
import { PlayIcon } from "lucide-react"

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
  date: {
    day: string
    month: string
  }
  image: string
  href: string
}

export function videoCardDate(date: Date | null) {
  if (!date) return { day: "-", month: "" }

  const formatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Makassar",
  })
  const parts = formatter.formatToParts(date)

  return {
    day: parts.find((part) => part.type === "day")?.value ?? "-",
    month: parts.find((part) => part.type === "month")?.value ?? "",
  }
}

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <article>
      <Card className="grid gap-0 py-0 transition-shadow hover:shadow-md sm:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="relative aspect-video w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-56">
          <img src={video.image} alt={video.title} className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
            <span className="flex size-12 items-center justify-center rounded-full bg-background/90 text-primary shadow-sm backdrop-blur">
              <PlayIcon className="size-5 fill-current" />
            </span>
          </div>
          <div className="absolute top-4 left-4 flex min-w-14 flex-col items-center rounded-lg bg-background/90 px-3 py-2 text-center shadow-sm backdrop-blur">
            <span className="text-xl leading-none font-semibold text-foreground">
              {video.date.day}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {video.date.month}
            </span>
          </div>
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
