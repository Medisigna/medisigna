import Link from "next/link"
import {
  ClockIcon,
  MessageCircleIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { StartChatPrompt } from "@/components/consultation/start-chat-prompt"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type PharmacistCard = {
  id: string
  title: string
  profilePhotoUrl: string | null
  bio: string
  topics: string[]
  practiceLocation: string
  serviceHours: string
  availabilityStatus: "ONLINE" | "OFFLINE"
  user: { name: string; image: string | null }
}

const statusLabels: Record<string, string> = {
  all: "Semua",
  online: "Online",
  offline: "Offline",
}

const availabilityLabels: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export default async function PharmacistListPage({ searchParams }: PageProps) {
  const params = await searchParams
  const status = typeof params?.status === "string" && params.status in statusLabels ? params.status : "all"
  const availabilityStatus =
    status === "online" ? "ONLINE" : status === "offline" ? "OFFLINE" : undefined
  const pharmacists = (await db.pharmacistProfile.findMany({
    where: {
      verificationStatus: "VERIFIED",
      ...(availabilityStatus ? { availabilityStatus } : {}),
    },
    include: { user: true },
    orderBy: [{ availabilityStatus: "asc" }, { updatedAt: "desc" }],
  })) as PharmacistCard[]

  return (
    <main className="min-h-full bg-muted-foreground/5">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
        <AppMessage error={params?.error} success={params?.success} />

        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Pilih Apoteker</h1>
          <nav
            aria-label="Filter ketersediaan apoteker"
            className="flex w-fit gap-1 rounded-xl bg-muted p-1"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <Button key={key} asChild variant={key === status ? "default" : "ghost"} size="sm">
                <Link
                  href={
                    key === "all"
                      ? "/dashboard/pharmacists"
                      : `/dashboard/pharmacists?status=${key}`
                  }
                  aria-current={key === status ? "page" : undefined}
                >
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
        {pharmacists.length ? (
          pharmacists.map((profile) => {
            const isOnline = profile.availabilityStatus === "ONLINE"

            return (
              <Card
                key={profile.id}
                className="rounded-3xl bg-card py-5 shadow-none ring-0 transition-shadow duration-200 hover:shadow-md"
              >
                <CardHeader className="items-center">
                  <div className="flex items-center gap-3">
                    {/* <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <MessageCircleIcon className="size-4" />
                    </div> */}
                    <CardTitle className="text-base text-muted-foreground">
                      Apoteker
                    </CardTitle>
                  </div>
                  <CardAction>
                    <span
                      className={cn(
                        "rounded-xl border px-3 py-1.5 text-xs font-medium",
                        isOnline
                          ? "border-green-500 text-green-500"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {availabilityLabels[profile.availabilityStatus]}
                    </span>
                  </CardAction>
                </CardHeader>

                <CardContent className="grid grid-cols-[6.5rem_1fr] gap-4 sm:grid-cols-[8rem_1fr]">
                  <Avatar className="size-full min-h-36 rounded-2xl">
                    <AvatarImage
                      className="rounded-2xl"
                      src={profile.profilePhotoUrl ?? profile.user.image ?? undefined}
                      alt={profile.user.name}
                    />
                    <AvatarFallback className="rounded-2xl text-xl font-semibold">
                      {initials(profile.user.name)}
                    </AvatarFallback>
                    {/* <AvatarBadge
                      className={isOnline ? "bg-primary" : "bg-muted-foreground"}
                      aria-label={availabilityLabels[profile.availabilityStatus]}
                    /> */}
                  </Avatar>

                  <div className="flex min-w-0 flex-col">
                    <Link
                      href={`/dashboard/pharmacists/${profile.id}`}
                      className="w-fit text-xl font-semibold tracking-tight hover:text-primary sm:text-2xl"
                    >
                      {profile.user.name}
                    </Link>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {profile.title}
                      {profile.topics[0] ? ` · ${profile.topics[0]}` : ""}
                    </p>
                    <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                      <ClockIcon className="mt-0.5 size-4 shrink-0" />
                      <span>
                        {profile.serviceHours}
                        <span className="mx-1.5">|</span>
                        {profile.practiceLocation}
                      </span>
                    </div>

                    <div className="mt-auto pt-4">
                      {isOnline ? (
                        <StartChatPrompt
                          pharmacistId={profile.id}
                          name={profile.user.name}
                          title={profile.title}
                          image={profile.profilePhotoUrl ?? profile.user.image ?? undefined}
                          bio={profile.bio}
                          topics={profile.topics}
                          practiceLocation={profile.practiceLocation}
                          serviceHours={profile.serviceHours}
                        />
                      ) : (
                        <Button disabled className="w-full">
                          Apoteker Offline
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card className="bg-card shadow-none ring-0 md:col-span-2 xl:col-span-3">
            <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {status === "online" ? (
                  <SearchIcon className="size-6" />
                ) : (
                  <ShieldCheckIcon className="size-6" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  {status === "online" ? "Belum ada yang online" : "Belum ada apoteker"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Coba lihat semua apoteker.</p>
              </div>
              {status !== "all" ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/pharmacists">Lihat Semua</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </main>
  )
}
