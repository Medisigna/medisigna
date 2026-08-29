import Link from "next/link"
import { notFound } from "next/navigation"

import { startConsultationSession } from "@/app/actions/consultation/start-session"
import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const availabilityLabels: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "Offline",
}

export default async function PharmacistDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const query = await searchParams
  const profile = await db.pharmacistProfile.findFirst({
    where: {
      id,
      verificationStatus: "VERIFIED",
      user: {
        role: "PHARMACIST",
        status: "ACTIVE",
      },
    },
    include: { user: true },
  })

  if (!profile) notFound()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 py-6 md:py-8">
      <AppMessage error={query?.error} success={query?.success} />
      <section className="rounded-md border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Detail Apoteker</p>
            <h1 className="mt-1 text-2xl font-semibold">
              {profile.user.name}, {profile.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {profile.practiceLocation} - {profile.serviceHours}
            </p>
          </div>
          <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            {availabilityLabels[profile.availabilityStatus]}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nomor STR</dt>
            <dd>{profile.strNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Topik bantuan</dt>
            <dd>{profile.topics.join(", ")}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Bio</dt>
            <dd>{profile.bio}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Pengalaman</dt>
            <dd>{profile.experienceSummary}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {profile.availabilityStatus === "ONLINE" ? (
            <form action={startConsultationSession.bind(null, profile.id)}>
              <Button type="submit">Mulai Chat</Button>
            </form>
          ) : (
            <Button disabled>Offline</Button>
          )}
          <Button asChild variant="outline">
            <Link href="/dashboard/pharmacists">Kembali</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
