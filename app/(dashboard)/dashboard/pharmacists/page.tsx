import Link from "next/link"

import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"

export default async function PharmacistListPage() {
  const pharmacists = await db.pharmacistProfile.findMany({
    where: { verificationStatus: "VERIFIED" },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <section>
        <h1 className="text-xl font-semibold">Apoteker Terverifikasi</h1>
        <p className="text-sm text-muted-foreground">Hanya apoteker yang sudah disetujui admin.</p>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        {pharmacists.length ? (
          pharmacists.map((profile: any) => (
            <article key={profile.id} className="rounded-md border bg-card p-4">
              <h2 className="font-medium">
                {profile.user.name}, {profile.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.practiceLocation} - {profile.availabilityStatus === "ONLINE" ? "Online" : "Offline"}
              </p>
              <p className="mt-3 text-sm">{profile.bio}</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/chat">Mulai Chat</Link>
              </Button>
            </article>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada apoteker terverifikasi.</p>
        )}
      </div>
    </main>
  )
}
