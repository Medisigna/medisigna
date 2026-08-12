import Link from "next/link"
import { SearchIcon } from "lucide-react"

import { StartChatPrompt } from "@/components/consultation/start-chat-prompt"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import {
  PharmacistCard,
  type PharmacistCardData,
} from "@/components/pharmacists/pharmacist-card"
import { PharmacistSearch } from "@/components/pharmacists/pharmacist-search"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { db } from "@/lib/db"
import { getCurrentUser, homeForRole } from "@/lib/session"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const softCardClass =
  "rounded-[1.75rem] border-0 bg-card shadow-none ring-0 hover:shadow-none"

export default async function PublicPharmacistsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const selectedPharmacist =
    typeof params?.pharmacist === "string" ? params.pharmacist : undefined
  const [pharmacists, user] = await Promise.all([
    db.pharmacistProfile.findMany({
      where: {
        verificationStatus: "VERIFIED",
        ...(query
          ? {
              OR: [
                { title: { contains: query, mode: "insensitive" } },
                { bio: { contains: query, mode: "insensitive" } },
                { practiceLocation: { contains: query, mode: "insensitive" } },
                { experienceSummary: { contains: query, mode: "insensitive" } },
                { topics: { has: query } },
                { user: { name: { contains: query, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: { user: true },
      orderBy: [{ availabilityStatus: "asc" }, { updatedAt: "desc" }],
    }) as Promise<PharmacistCardData[]>,
    getCurrentUser(),
  ])

  return (
    <main className="min-h-svh bg-secondary">
      <SiteHeader />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
        <section className="flex flex-col items-start gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Pilih Apoteker
          </h1>
          <PharmacistSearch action="/pharmacists" query={query} variant="soft" />
        </section>

        <section className="grid max-w-4xl gap-4">
          {pharmacists.length ? (
            pharmacists.map((profile) => (
              <PharmacistCard
                key={profile.id}
                profile={profile}
                className={softCardClass}
                action={
                  profile.availabilityStatus !== "ONLINE" ? (
                    <Button disabled className="w-full">
                      Apoteker Offline
                    </Button>
                  ) : user && user.role !== "PATIENT" ? (
                    <Button asChild className="w-full">
                      <Link href={homeForRole(user.role)}>
                        Kembali ke Dashboard
                      </Link>
                    </Button>
                  ) : (
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
                      loginHref={
                        user
                          ? undefined
                          : `/login?callbackUrl=${encodeURIComponent(
                              `/pharmacists?pharmacist=${profile.id}`
                            )}`
                      }
                      defaultOpen={selectedPharmacist === profile.id}
                    />
                  )
                }
              />
            ))
          ) : (
            <Card className="max-w-4xl rounded-[1.75rem] border-0 bg-card shadow-none ring-0">
              <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <SearchIcon className="size-6" />
                </div>
                <div>
                  <p className="font-medium">Apoteker tidak ditemukan</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Coba gunakan nama, topik, atau lokasi lain.
                  </p>
                </div>
                {query ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/pharmacists">Lihat Semua</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
      <SiteFooter />
    </main>
  )
}
