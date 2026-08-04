import Link from "next/link"
import { ArrowRightIcon, NewspaperIcon, PlayCircleIcon } from "lucide-react"

import { ArticleCard } from "@/components/articles/article-card"
import { articleListCard } from "@/components/articles/article-list-page"
import { DashboardPromoCarousel } from "@/components/dashboard-promo-carousel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { VideoCard } from "@/components/videos/video-card"
import { videoListCard } from "@/components/videos/video-list-page"
import { getArticles } from "@/lib/articles"
import { getVideos } from "@/lib/educational-videos"
import { requireRole } from "@/lib/session"

const softCardClass =
  "rounded-[1.75rem] border-0 bg-card shadow-none ring-0 hover:shadow-none"

const quickMenuItems: {
  href?: string
  label: string
  iconSrc: string
  comingSoon?: boolean
}[] = [
  {
    href: "/pharmacist/dashboard/chat",
    label: "Chat Pasien",
    iconSrc: "/menu-icons/consult.png",
  },
  {
    href: "/pharmacist/dashboard/forum",
    label: "Forum Diskusi",
    iconSrc: "/menu-icons/Forum.png",
  },
  {
    href: "/pharmacist/dashboard/obat",
    label: "Obat A-Z",
    iconSrc: "/menu-icons/medicines.png",
  },
  {
    href: "/pharmacist/dashboard/tulis-obat",
    label: "Tulis Obat",
    iconSrc: "/menu-icons/medicines.png",
  },
  {
    href: "/pharmacist/dashboard/tulis-artikel",
    label: "Tulis Artikel",
    iconSrc: "/menu-icons/article.png",
  },
  {
    href: "/pharmacist/dashboard/tulis-video",
    label: "Buat Video",
    iconSrc: "/menu-icons/education.png",
  },
  {
    label: "Beli Obat",
    iconSrc: "/menu-icons/Shop.png",
    comingSoon: true,
  },
  {
    label: "AI Apoteker",
    iconSrc: "/menu-icons/AI.png",
    comingSoon: true,
  },
]

function greeting() {
  const hour = new Date().getHours()

  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-secondary-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <Card size="sm" className={softCardClass}>
      <CardContent className="flex flex-col items-start gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  )
}

function QuickMenu() {
  return (
    <nav
      aria-label="Menu cepat apoteker"
      className="grid grid-cols-4 gap-2 sm:gap-3 md:hidden"
    >
      {quickMenuItems.map((item) => {
        const content = (
          <>
            <span className="flex size-10 items-center justify-center">
              <img
                src={item.iconSrc}
                alt=""
                aria-hidden="true"
                className="size-7 object-contain"
                loading="lazy"
              />
            </span>
            <span className="max-w-full px-1 text-[11px] leading-tight font-semibold text-secondary-foreground">
              {item.label}
            </span>
            {item.comingSoon ? (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] leading-none font-semibold text-yellow-700">
                Segera
              </span>
            ) : null}
          </>
        )
        const className =
          "group flex h-20 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.25rem] bg-card text-center shadow-none ring-0 transition-colors hover:bg-card/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"

        if (!item.href) {
          return (
            <div
              key={item.label}
              aria-disabled="true"
              className={`${className} opacity-85`}
            >
              {content}
            </div>
          )
        }

        return (
          <Link key={item.href} href={item.href} className={className}>
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

export default async function PharmacistDashboardPage() {
  const user = await requireRole("PHARMACIST")
  const [articles, videos] = await Promise.all([
    getArticles({ publishedOnly: true, limit: 3 }),
    getVideos({ publishedOnly: true, limit: 3 }),
  ])

  return (
    <main className="min-h-[calc(100dvh-7rem)] rounded-[2rem] bg-secondary py-4 md:rounded-[2.25rem] md:py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:gap-8">
        <section className="flex min-w-0 items-center gap-4 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">
              {greeting()}
            </p>
            <h2 className="truncate text-xl font-semibold tracking-tight text-secondary-foreground md:text-3xl">
              {user.name}
            </h2>
          </div>
        </section>

        <DashboardPromoCarousel variant="soft" />

        <div className="flex flex-col gap-8 md:gap-10">
          <QuickMenu />

          <section className="flex flex-col gap-3">
            <SectionHeading
              title="Artikel kesehatan terbaru"
              action={
                <Button asChild variant="outline" size="xs">
                  <Link href="/artikel">
                    Lihat Semua
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              }
            />
            {articles.articles.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {articles.articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={articleListCard(article)}
                    className={softCardClass}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={NewspaperIcon}
                title="Belum ada artikel"
                description="Artikel kesehatan terbit akan muncul di sini."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/artikel">Cek Artikel</Link>
                  </Button>
                }
              />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <SectionHeading
              title="Video edukasi populer"
              action={
                <Button asChild variant="outline" size="xs">
                  <Link href="/video">
                    Lihat Semua
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              }
            />
            {videos.videos.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {videos.videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={videoListCard(video)}
                    className={softCardClass}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PlayCircleIcon}
                title="Belum ada video"
                description="Video edukasi terbit akan muncul di sini."
                action={
                  <Button asChild variant="outline" size="sm">
                    <Link href="/video">Cek Video</Link>
                  </Button>
                }
              />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
