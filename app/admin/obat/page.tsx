import Link from "next/link"
import { EditIcon, ExternalLinkIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { AlphabetFilter, parseAlphabetLetter } from "@/components/drugs/alphabet-filter"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAdminDrugs } from "@/lib/drugs"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const statusOptions = ["ALL", "DRAFT", "PUBLISHED"] as const
const demoOptions = ["ALL", "DEMO", "PRODUCTION"] as const

const statusLabels = {
  ALL: "Semua",
  DRAFT: "Draft",
  PUBLISHED: "Published",
}

const demoLabels = {
  ALL: "Semua",
  DEMO: "Demo",
  PRODUCTION: "Produksi",
}

function parsePage(value: string | string[] | undefined) {
  if (typeof value !== "string") return 1

  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function parseOption<T extends readonly string[]>(
  value: string | string[] | undefined,
  options: T,
  fallback: T[number]
) {
  return typeof value === "string" && options.includes(value) ? (value as T[number]) : fallback
}

function formatDate(date: Date | null) {
  if (!date) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function pageHref({
  query,
  letter,
  status,
  demo,
  page,
}: {
  query: string
  letter: string
  status: string
  demo: string
  page: number
}) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (letter) params.set("letter", letter)
  if (status !== "ALL") params.set("status", status)
  if (demo !== "ALL") params.set("demo", demo)
  params.set("page", String(page))

  return `/admin/obat?${params.toString()}`
}

function letterHref({
  query,
  activeLetter,
  nextLetter,
  status,
  demo,
}: {
  query: string
  activeLetter: string
  nextLetter: string
  status: string
  demo: string
}) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (nextLetter !== activeLetter) params.set("letter", nextLetter)
  if (status !== "ALL") params.set("status", status)
  if (demo !== "ALL") params.set("demo", demo)

  return params.size ? `/admin/obat?${params.toString()}` : "/admin/obat"
}

export default async function AdminDrugsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const letter = parseAlphabetLetter(params?.letter)
  const page = parsePage(params?.page)
  const status = parseOption(params?.status, statusOptions, "ALL")
  const demo = parseOption(params?.demo, demoOptions, "ALL")
  const result = await getAdminDrugs({ query, letter, page, status, demo })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Admin</p>
          <h1 className="text-2xl font-semibold">Informasi Obat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.drugs.length} dari {result.total} informasi
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/obat/new">
            <PlusIcon data-icon="inline-start" />
            Tambah Obat
          </Link>
        </Button>
      </header>

      <form action="/admin/obat" className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
        <InputGroup className="h-11 bg-background shadow-sm">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Cari obat, merek, atau alias"
            aria-label="Cari obat"
          />
          {letter ? <input type="hidden" name="letter" value={letter} /> : null}
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit">Cari</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-md border bg-background px-3 text-sm"
          aria-label="Filter status"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {statusLabels[option]}
            </option>
          ))}
        </select>
        <select
          name="demo"
          defaultValue={demo}
          className="h-11 rounded-md border bg-background px-3 text-sm"
          aria-label="Filter demo"
        >
          {demoOptions.map((option) => (
            <option key={option} value={option}>
              {demoLabels[option]}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 lg:flex-none">
            Terapkan
          </Button>
          {query || letter || status !== "ALL" || demo !== "ALL" ? (
            <Button asChild variant="ghost" size="icon" aria-label="Hapus filter">
              <Link href="/admin/obat">
                <XIcon />
              </Link>
            </Button>
          ) : null}
        </div>
      </form>

      <AlphabetFilter
        activeLetter={letter}
        hrefForLetter={(nextLetter) =>
          letterHref({ query, activeLetter: letter, nextLetter, status, demo })
        }
      />

      <section className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama generik</TableHead>
              <TableHead>Merek</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Tanggal review</TableHead>
              <TableHead>Review ulang</TableHead>
              <TableHead>Terakhir diubah</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.drugs.length ? (
              result.drugs.map((drug) => (
                <TableRow key={drug.id}>
                  <TableCell className="font-medium">{drug.genericName}</TableCell>
                  <TableCell>{drug.brandNames.join(", ") || "-"}</TableCell>
                  <TableCell>{statusLabels[drug.status]}</TableCell>
                  <TableCell>{drug.isDemo ? "Demo" : "Produksi"}</TableCell>
                  <TableCell>{drug.reviewer.name}</TableCell>
                  <TableCell>{formatDate(drug.reviewedAt)}</TableCell>
                  <TableCell>{formatDate(drug.reviewDueAt)}</TableCell>
                  <TableCell>{formatDate(drug.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon-sm" aria-label="Edit">
                        <Link href={`/admin/obat/${drug.id}`}>
                          <EditIcon />
                        </Link>
                      </Button>
                      {drug.status === "PUBLISHED" ? (
                        <Button asChild variant="ghost" size="icon-sm" aria-label="Preview publik">
                          <Link href={`/obat/${drug.slug}`} target="_blank">
                            <ExternalLinkIcon />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  Informasi obat tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {result.total ? (
        <div className="flex items-center justify-between gap-3">
          {result.hasPreviousPage ? (
            <Button asChild variant="outline">
              <Link href={pageHref({ query, letter, status, demo, page: result.page - 1 })}>
                Sebelumnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Sebelumnya
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            Halaman {result.page} dari {result.totalPages}
          </p>
          {result.hasNextPage ? (
            <Button asChild variant="outline">
              <Link href={pageHref({ query, letter, status, demo, page: result.page + 1 })}>
                Berikutnya
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Berikutnya
            </Button>
          )}
        </div>
      ) : null}
    </main>
  )
}
