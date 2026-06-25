import Link from "next/link"
import { ClockIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type PharmacistCardData = {
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

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function PharmacistCard({
  profile,
  href,
  action,
}: {
  profile: PharmacistCardData
  href?: string
  action: React.ReactNode
}) {
  const isOnline = profile.availabilityStatus === "ONLINE"

  return (
    <Card className="rounded-3xl bg-card py-5 shadow-none ring-0 transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="items-center">
        <CardTitle className="text-base text-muted-foreground">Apoteker</CardTitle>
        <CardAction>
          <span
            className={cn(
              "rounded-xl border px-3 py-1.5 text-xs font-medium",
              isOnline
                ? "border-green-500 text-green-500"
                : "border-border text-muted-foreground"
            )}
          >
            {isOnline ? "Online" : "Offline"}
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
        </Avatar>

        <div className="flex min-w-0 flex-col">
          {href ? (
            <Link
              href={href}
              className="w-fit text-xl font-semibold tracking-tight hover:text-primary sm:text-2xl"
            >
              {profile.user.name}
            </Link>
          ) : (
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {profile.user.name}
            </h2>
          )}
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
          <div className="mt-auto pt-4">{action}</div>
        </div>
      </CardContent>
    </Card>
  )
}
