import { logout } from "@/app/actions/auth/logout"
import { AppMessage } from "@/components/app-message"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { requireRole } from "@/lib/session"
import {
  ChevronRightIcon,
  CircleHelpIcon,
  InfoIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function ProfileRow({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 items-center gap-3 px-4 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Icon aria-hidden="true" className="text-muted-foreground" />
      <span className="flex-1 text-foreground">{label}</span>
      <ChevronRightIcon aria-hidden="true" className="text-muted-foreground/70" />
    </Link>
  )
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const user = await requireRole("PATIENT")
  const params = await searchParams

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 bg-background px-4 py-7 text-foreground md:my-6 md:min-h-0 md:px-8 md:py-8">
      <AppMessage error={params?.error} success={params?.success} />

      <section className="flex items-center gap-4 rounded-xl bg-card px-4 py-5">
        <Avatar className="size-20">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="text-lg font-semibold">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{user.name}</h2>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </section>

      <section aria-labelledby="account-title" className="flex flex-col gap-3">
        <h2 id="account-title" className="px-1 text-sm font-semibold uppercase tracking-wide text-foreground/80">
          Akun
        </h2>
        <div className="overflow-hidden rounded-xl bg-card">
          <ProfileRow icon={UserIcon} label="Detail pribadi" href="/dashboard/profile/personal-details" />
          <ProfileRow icon={InfoIcon} label="Informasi & izin" href="/dashboard/profile" />
        </div>
      </section>

      <section aria-labelledby="setting-title" className="flex flex-col gap-3">
        <h2 id="setting-title" className="px-1 text-sm font-semibold uppercase tracking-wide text-foreground/80">
          Pengaturan
        </h2>
        <div className="overflow-hidden rounded-xl bg-card">
          <ProfileRow icon={CircleHelpIcon} label="Bantuan & dukungan" href="/contact" />
        </div>
      </section>

      <form action={logout} className="overflow-hidden rounded-xl bg-card">
        <button
          type="submit"
          className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <LogOutIcon aria-hidden="true" />
          <span className="flex-1">Keluar</span>
          <ChevronRightIcon aria-hidden="true" className="text-destructive/70" />
        </button>
      </form>
    </main>
  )
}
