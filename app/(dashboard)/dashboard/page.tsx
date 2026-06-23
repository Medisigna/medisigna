import Link from "next/link"
import {
  ArrowRightIcon,
  ClockIcon,
  MessageCircleIcon,
  PillIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { DashboardPromoCarousel } from "@/components/dashboard-promo-carousel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { cn } from "@/lib/utils"

const sessionStatusLabels: Record<string, string> = {
  ACTIVE: "Aktif",
  WAITING_USER: "Menunggu kamu",
  WAITING_PHARMACIST: "Menunggu apoteker",
  COMPLETED: "Selesai",
  REFERRED: "Dirujuk",
  CANCELED: "Dibatalkan",
}

type PharmacistCard = {
  id: string
  title: string
  bio: string
  practiceLocation: string
  serviceHours: string
  availabilityStatus: string
  user: { name: string }
}

type SessionPreview = {
  id: string
  status: string
  updatedAt: Date
  pharmacist: { name: string }
  summary: { mainProblem: string } | null
}

function greeting() {
  const hour = new Date().getHours()

  if (hour < 11) return "Selamat pagi"
  if (hour < 15) return "Selamat siang"
  if (hour < 18) return "Selamat sore"
  return "Selamat malam"
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "primary" | "muted" | "danger"
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        tone === "primary" && "border-primary/20 bg-primary/10 text-primary",
        tone === "muted" && "border-border bg-muted text-muted-foreground",
        tone === "danger" && "border-destructive/20 bg-destructive/10 text-destructive",
        tone === "neutral" && "border-border bg-secondary text-secondary-foreground"
      )}
    >
      {children}
    </span>
  )
}

function sessionTone(status: string): React.ComponentProps<typeof StatusPill>["tone"] {
  if (status === "ACTIVE" || status === "WAITING_USER") return "primary"
  if (status === "CANCELED") return "danger"
  if (status === "COMPLETED") return "muted"
  return "neutral"
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
  const [pharmacists, sessions] = (await Promise.all([
    db.pharmacistProfile.findMany({
      where: { verificationStatus: "VERIFIED" },
      include: { user: true },
      take: 3,
      orderBy: { updatedAt: "desc" },
    }),
    db.consultationSession.findMany({
      where: { patientId: user.id },
      include: {
        pharmacist: { select: { name: true } },
        summary: { select: { mainProblem: true } },
      },
      take: 3,
      orderBy: { updatedAt: "desc" },
    }),
  ])) as [PharmacistCard[], SessionPreview[]]

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <section className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex min-w-0 flex-row gap-1">
          <span className="text-sm md:text-base text-foreground">
            {greeting()}, <span className="font-bold text-lg md:text-xl">{user.name}😇</span>
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
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pharmacists.map((profile) => (
              <Card key={profile.id} size="sm" className="min-h-52">
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {profile.user.name}, {profile.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {profile.practiceLocation}
                  </CardDescription>
                  <CardAction>
                    <StatusPill
                      tone={profile.availabilityStatus === "ONLINE" ? "primary" : "muted"}
                    >
                      {profile.availabilityStatus === "ONLINE" ? "Online" : "Offline"}
                    </StatusPill>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-3">
                  <p className="line-clamp-3 text-sm text-muted-foreground">{profile.bio}</p>
                  <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <ClockIcon className="size-3.5" />
                    <span className="truncate">{profile.serviceHours}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/dashboard/chat">
                      Mulai Chat
                      <MessageCircleIcon data-icon="inline-end" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
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
        <SectionHeading title="Chat terakhir" description="Lanjutkan konsultasi yang pernah kamu mulai." />
        {sessions.length ? (
          <div className="grid gap-3">
            {sessions.map((session) => (
              <Card key={session.id} size="sm">
                <CardHeader>
                  <CardTitle>{session.pharmacist.name}</CardTitle>
                  <CardDescription>{formatDate(session.updatedAt)}</CardDescription>
                  <CardAction>
                    <Button asChild size="icon-sm" variant="outline" aria-label="Buka chat">
                      <Link href="/dashboard/chat">
                        <MessageCircleIcon />
                      </Link>
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <StatusPill tone={sessionTone(session.status)}>
                    {sessionStatusLabels[session.status] ?? "Status tidak diketahui"}
                  </StatusPill>
                  {session.summary ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {session.summary.mainProblem}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada ringkasan konsultasi.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={PillIcon}
            title="Belum ada chat"
            description="Mulai chat pertama dengan apoteker pilihan."
            action={
              <Button asChild size="sm">
                <Link href="/dashboard/pharmacists">
                  Cari Apoteker
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </main>
  )
}
