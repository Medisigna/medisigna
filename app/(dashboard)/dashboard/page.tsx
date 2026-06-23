import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"

export default async function HomePage() {
  const pharmacists = await db.pharmacistProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: { user: true },
    take: 6,
    orderBy: { updatedAt: "desc" },
  })

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <section className="rounded-md border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Apoteker terverifikasi</h1>
            <p className="text-sm text-muted-foreground">Pilih apoteker untuk mulai konsultasi.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/pharmacists">Lihat Semua</Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {pharmacists.length ? (
            pharmacists.map((profile: any) => (
              <article key={profile.id} className="rounded-md border p-4">
                <h2 className="font-medium">
                  {profile.user.name}, {profile.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{profile.practiceLocation}</p>
                <p className="mt-3 text-sm">{profile.bio}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada apoteker terverifikasi.</p>
          )}
        </div>
      </section>
    </main>
  )
}
