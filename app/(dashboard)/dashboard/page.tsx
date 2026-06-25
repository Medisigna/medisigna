import Link from "next/link"
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react"

import { StartChatPrompt } from "@/components/consultation/start-chat-prompt"
import { DashboardPromoCarousel } from "@/components/dashboard-promo-carousel"
import {
  PharmacistCard,
  type PharmacistCardData,
} from "@/components/pharmacists/pharmacist-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"
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
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
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
  const pharmacists = (await db.pharmacistProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: { user: true },
    take: 3,
    orderBy: { updatedAt: "desc" },
  })) as PharmacistCardData[]

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex min-w-0 flex-row gap-1">
          <span className="text-sm text-foreground md:text-base">
            {greeting()},{" "}
            <span className="text-lg font-bold md:text-xl">{user.name}😇</span>
          </span>
        </div>
      </section>

      <DashboardPromoCarousel />

      <section className="flex flex-col gap-3">
        <SectionHeading
          title="Apoteker pilihan"
          description="Apoteker terverifikasi terbaru."
          action={
            <Button asChild variant="outline" size="sm">
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
                      bio={profile.bio}
                      topics={profile.topics}
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
    </main>
  )
}
