import Link from "next/link"

import { reviewPharmacist } from "@/app/actions/admin/review-pharmacist"
import { logout } from "@/app/actions/auth/logout"
import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu Verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  NEEDS_REVISION: "Perlu Revisi",
}

const statuses = Object.keys(statusLabels)

function filePreview(src?: string | null) {
  if (!src) return <span className="text-sm text-muted-foreground">Tidak ada</span>
  if (src.startsWith("data:application/pdf")) {
    return (
      <a className="text-sm underline-offset-4 hover:underline" href={src} target="_blank" rel="noreferrer">
        Buka PDF
      </a>
    )
  }

  return <img src={src} alt="Preview dokumen" className="h-24 w-24 rounded-md border object-cover" />
}

export default async function AdminPage({ searchParams }: PageProps) {
  await requireRole("ADMIN")
  const params = await searchParams
  const status = typeof params?.status === "string" && statuses.includes(params.status) ? params.status : "PENDING"
  const pharmacists = await db.pharmacistProfile.findMany({
    where: { verificationStatus: status },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })
  const users = await db.user.count()

  return (
    <main className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 px-6 py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Admin</p>
          <h1 className="text-2xl font-semibold">Verifikasi Apoteker</h1>
          <p className="mt-1 text-sm text-muted-foreground">{users} user terdaftar</p>
        </div>
        <form action={logout}>
          <Button variant="outline" type="submit">
            Keluar
          </Button>
        </form>
      </header>

      <AppMessage error={params?.error} success={params?.success} />

      <nav className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <Button key={item} asChild variant={item === status ? "default" : "outline"} size="sm">
            <Link href={`/admin?status=${item}`}>{statusLabels[item]}</Link>
          </Button>
        ))}
      </nav>

      <section className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apoteker</TableHead>
              <TableHead>STR</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pharmacists.length ? (
              pharmacists.map((profile: any) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.user.name}</TableCell>
                  <TableCell>{profile.strNumber}</TableCell>
                  <TableCell>{profile.practiceLocation}</TableCell>
                  <TableCell>{statusLabels[profile.verificationStatus]}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Tidak ada pendaftaran.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <div className="grid gap-4">
        {pharmacists.map((profile: any) => (
          <article key={profile.id} className="rounded-md border bg-card p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-lg font-medium">
                  {profile.user.name}, {profile.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{profile.user.email}</p>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Nomor STR</dt>
                    <dd>{profile.strNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Lokasi praktik</dt>
                    <dd>{profile.practiceLocation}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Jam layanan</dt>
                    <dd>{profile.serviceHours}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Topik bantuan</dt>
                    <dd>{profile.topics.join(", ")}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm">{profile.bio}</p>
                <p className="mt-2 text-sm text-muted-foreground">{profile.experienceSummary}</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Foto profil</p>
                    {filePreview(profile.profilePhotoUrl)}
                  </div>
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">Dokumen STR</p>
                    {filePreview(profile.strDocumentUrl)}
                  </div>
                </div>
                <form action={reviewPharmacist} className="flex flex-col gap-3">
                  <input type="hidden" name="profileId" value={profile.id} />
                  <Textarea name="adminNote" placeholder="Catatan admin" defaultValue={profile.adminNote ?? ""} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" name="action" value="approve" size="sm">
                      Setujui
                    </Button>
                    <Button type="submit" name="action" value="reject" variant="destructive" size="sm">
                      Tolak
                    </Button>
                    <Button type="submit" name="action" value="revision" variant="outline" size="sm">
                      Minta Revisi
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
