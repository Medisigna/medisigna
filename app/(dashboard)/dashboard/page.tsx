import Link from "next/link"
import {
  ArrowRightIcon,
  NewspaperIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { ArticleCard } from "@/components/articles/article-card"
import { articleListCard } from "@/components/articles/article-list-page"
import { StartChatPrompt } from "@/components/consultation/start-chat-prompt"
import { DashboardPromoCarousel } from "@/components/dashboard-promo-carousel"
import {
  PharmacistCard,
  type PharmacistCardData,
} from "@/components/pharmacists/pharmacist-card"
import { VideoCard } from "@/components/videos/video-card"
import { videoListCard } from "@/components/videos/video-list-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getArticles } from "@/lib/articles"
import { db } from "@/lib/db"
import { getVideos } from "@/lib/educational-videos"
import { requireRole } from "@/lib/session"

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
          <p className="mt-0.5 text-sm text-muted-foreground">
            {description}
          </p>
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
    <Card size="sm" className="border-dashed">
      <CardContent className="flex flex-col items-start gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
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

export default async function HomePage() {
  const user = await requireRole("PATIENT")
  const [pharmacists, videos, articles] = await Promise.all([
    db.pharmacistProfile.findMany({
      where: { verificationStatus: "VERIFIED" },
      include: { user: true },
      take: 3,
      orderBy: [{ availabilityStatus: "asc" }, { updatedAt: "desc" }],
    }) as Promise<PharmacistCardData[]>,
    getVideos({ publishedOnly: true, limit: 3 }),
    getArticles({ publishedOnly: true, limit: 3 }),
  ])

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-4 md:gap-10 md:px-6 md:py-8">
      <section className="flex min-w-0 flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          {greeting()},  <span className="truncate text-xl font-semibold tracking-tight text-secondary-foreground md:text-3xl">
            {user.name}
          </span>
        </p>
      </section>

      <DashboardPromoCarousel />

      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Apoteker terbaik"
          action={
            <Button asChild variant="outline" size="xs">
              <Link href="/dashboard/pharmacists">
                Lihat Semua
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          }
        />
        {pharmacists.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {pharmacists.map((profile) => (
              <PharmacistCard
                key={profile.id}
                profile={profile}
                href={`/dashboard/pharmacists/${profile.id}`}
                action={
                  profile.availabilityStatus === "ONLINE" ? (
                    <StartChatPrompt
                      pharmacistId={profile.id}
                      name={profile.user.name}
                      title={profile.title}
                      image={
                        profile.profilePhotoUrl ??
                        profile.user.image ??
                        undefined
                      }
                      practiceLocation={profile.practiceLocation}
                      serviceHours={profile.serviceHours}
                    />
                  ) : (
                    <Button disabled className="w-full">
                      Apoteker Offline
                    </Button>
                  )
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheckIcon}
            title="Belum ada apoteker"
            description="Apoteker terverifikasi akan muncul di sini."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/pharmacists">Cek Apoteker</Link>
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
              <Link href="/dashboard/video">
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
                video={videoListCard(video, "/dashboard/video")}
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
                <Link href="/dashboard/video">Cek Video</Link>
              </Button>
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Artikel kesehatan terbaru"
          action={
            <Button asChild variant="outline" size="xs">
              <Link href="/dashboard/artikel">
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
                article={articleListCard(article, "/dashboard/artikel")}
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
                <Link href="/dashboard/artikel">Cek Artikel</Link>
              </Button>
            }
          />
        )}
      </section>
    </main>
  )
}
