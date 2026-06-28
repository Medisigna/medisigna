import Link from "next/link"
import {
  CheckIcon,
  PencilIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react"

import { reviewPharmacist } from "@/app/actions/admin/review-pharmacist"
import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/db"
import { cn } from "@/lib/utils"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const statusOptions = ["PENDING", "VERIFIED", "REJECTED", "NEEDS_REVISION"] as const
type VerificationStatus = (typeof statusOptions)[number]

type PharmacistRow = {
  id: string
  title: string
  strNumber: string
  profilePhotoUrl: string | null
  bio: string
  topics: string[]
  practiceLocation: string
  serviceHours: string
  experienceSummary: string
  strDocumentUrl: string | null
  verificationStatus: VerificationStatus
  adminNote: string | null
  createdAt: Date
  user: {
    name: string
    email: string
  }
}

const statusLabels: Record<VerificationStatus, string> = {
  PENDING: "Menunggu",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  NEEDS_REVISION: "Perlu Revisi",
}

function parseStatus(value: string | string[] | undefined) {
  return typeof value === "string" && statusOptions.includes(value as VerificationStatus)
    ? (value as VerificationStatus)
    : "PENDING"
}

function adminHref(query: string, status: VerificationStatus) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (status !== "PENDING") params.set("status", status)
  return params.size ? `/admin?${params.toString()}` : "/admin"
}

function filterHref(query: string, status: VerificationStatus) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (status !== "PENDING") params.set("status", status)
  return `/admin?${params.toString()}`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function fileLink(label: string, src?: string | null) {
  if (!src) return <span className="text-muted-foreground">Tidak ada</span>

  return (
    <a className="underline-offset-4 hover:underline" href={src} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}

export default async function AdminPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const status = parseStatus(params?.status)
  const currentHref = adminHref(query, status)
  const pharmacists = (await db.pharmacistProfile.findMany({
    where: {
      verificationStatus: status,
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { strNumber: { contains: query, mode: "insensitive" } },
              { practiceLocation: { contains: query, mode: "insensitive" } },
              { user: { name: { contains: query, mode: "insensitive" } } },
              { user: { email: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  })) as PharmacistRow[]
  const users = await db.user.count()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AppMessage error={params?.error} success={params?.success} />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Admin</p>
          <h1 className="text-2xl font-semibold">Verifikasi Apoteker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pharmacists.length} apoteker, {users} user terdaftar
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row">
        <form action="/admin" className="min-w-0 flex-1">
          <InputGroup className="h-11 bg-background shadow-sm">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Cari nama, email, STR, atau lokasi"
              aria-label="Cari apoteker"
            />
            {status !== "PENDING" ? <input type="hidden" name="status" value={status} /> : null}
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="submit">Cari</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 lg:flex-none">
                <SlidersHorizontalIcon data-icon="inline-start" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Status</DialogTitle>
                <DialogDescription>Pilih status verifikasi apoteker.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option}
                    asChild
                    variant={option === status ? "default" : "outline"}
                    className="justify-start"
                  >
                    <Link href={filterHref(query, option)}>{statusLabels[option]}</Link>
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {query || status !== "PENDING" ? (
            <Button asChild variant="ghost" size="icon" aria-label="Hapus filter">
              <Link href="/admin">
                <XIcon />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <section className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apoteker</TableHead>
              <TableHead>STR</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead>Catatan</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pharmacists.length ? (
              pharmacists.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{profile.user.name}</span>
                      <span className="max-w-56 truncate text-xs text-muted-foreground">
                        {profile.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{profile.strNumber}</TableCell>
                  <TableCell className="max-w-52 truncate">{profile.practiceLocation}</TableCell>
                  <TableCell>{statusLabels[profile.verificationStatus]}</TableCell>
                  <TableCell>{formatDate(profile.createdAt)}</TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {profile.adminNote || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Edit apoteker">
                            <PencilIcon />
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="icon-sm" aria-label="Tolak apoteker">
                            <XIcon />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{profile.user.name}</DialogTitle>
                            <DialogDescription>
                              {profile.title} - {profile.user.email}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                              <p className="text-muted-foreground">Nomor STR</p>
                              <p className="font-medium">{profile.strNumber}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Lokasi praktik</p>
                              <p className="font-medium">{profile.practiceLocation}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Jam layanan</p>
                              <p className="font-medium">{profile.serviceHours}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Dokumen</p>
                              <p className="font-medium">
                                {fileLink("Foto profil", profile.profilePhotoUrl)} -{" "}
                                {fileLink("STR", profile.strDocumentUrl)}
                              </p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-muted-foreground">Topik</p>
                              <p className="font-medium">{profile.topics.join(", ")}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-muted-foreground">Bio</p>
                              <p>{profile.bio}</p>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-muted-foreground">Pengalaman</p>
                              <p>{profile.experienceSummary}</p>
                            </div>
                          </div>
                          <form action={reviewPharmacist} className="flex flex-col gap-3">
                            <input type="hidden" name="profileId" value={profile.id} />
                            <input type="hidden" name="callbackUrl" value={currentHref} />
                            <Textarea
                              name="adminNote"
                              placeholder="Catatan admin"
                              defaultValue={profile.adminNote ?? ""}
                            />
                            <DialogFooter>
                              <Button type="submit" name="action" value="revision" variant="outline">
                                Perlu Revisi
                              </Button>
                              <Button type="submit" name="action" value="reject" variant="destructive">
                                Tolak
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <form action={reviewPharmacist}>
                        <input type="hidden" name="profileId" value={profile.id} />
                        <input type="hidden" name="callbackUrl" value={currentHref} />
                        <Button
                          type="submit"
                          name="action"
                          value="approve"
                          variant={profile.verificationStatus === "VERIFIED" ? "outline" : "ghost"}
                          size="icon-sm"
                          aria-label="Verifikasi apoteker"
                          className={cn(profile.verificationStatus !== "VERIFIED" && "text-primary")}
                        >
                          <CheckIcon />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Apoteker tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
