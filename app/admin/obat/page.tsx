import Link from "next/link"
import { EditIcon, ExternalLinkIcon, PlusIcon, XIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { AlphabetFilter, parseAlphabetLetter } from "@/components/drugs/alphabet-filter"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getAdminDrugs } from "@/lib/drugs"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const statusOptions = ["ALL", "DRAFT", "PUBLISHED", "REJECTED"] as const

const statusLabels = {
  ALL: "Semua",
  DRAFT: "Menunggu",
  PUBLISHED: "Terbit",
  REJECTED: "Ditolak",
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
  page,
}: {
  query: string
  letter: string
  status: string
  page: number
}) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (letter) params.set("letter", letter)
  if (status !== "ALL") params.set("status", status)
  params.set("page", String(page))

  return `/admin/obat?${params.toString()}`
}

function letterHref({
  query,
  activeLetter,
  nextLetter,
  status,
}: {
  query: string
  activeLetter: string
  nextLetter: string
  status: string
}) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (nextLetter !== activeLetter) params.set("letter", nextLetter)
  if (status !== "ALL") params.set("status", status)

  return params.size ? `/admin/obat?${params.toString()}` : "/admin/obat"
}

export default async function AdminDrugsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const letter = parseAlphabetLetter(params?.letter)
  const page = parsePage(params?.page)
  const status = parseOption(params?.status, statusOptions, "ALL")
  const result = await getAdminDrugs({ query, letter, page, status })

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

      <form action="/admin/obat" className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
        <DebouncedSearchInput
          action="/admin/obat"
          query={query}
          placeholder="Cari obat, merek, atau alias"
          ariaLabel="Cari obat"
          hiddenParams={{ letter, status: status !== "ALL" ? status : undefined }}
          inputGroupClassName="h-11 bg-background shadow-sm"
        />
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
        <div className="flex gap-2">
          <Button type="submit" className="flex-1 lg:flex-none">
            Terapkan
          </Button>
          {query || letter || status !== "ALL" ? (
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
          letterHref({ query, activeLetter: letter, nextLetter, status })
        }
      />

      <section className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama generik</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Tanggal review</TableHead>
              <TableHead>Review ulang</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.drugs.length ? (
              result.drugs.map((drug) => (
                <TableRow key={drug.id}>
                  <TableCell className="font-medium">{drug.genericName}</TableCell>
                  <TableCell>{statusLabels[drug.status]}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{drug.reviewer.name}</span>
                      {drug.status === "REJECTED" && drug.adminNote ? (
                        <span className="max-w-48 truncate text-xs text-muted-foreground">
                          {drug.adminNote}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(drug.reviewedAt)}</TableCell>
                  <TableCell>{formatDate(drug.reviewDueAt)}</TableCell>
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
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
              <Link href={pageHref({ query, letter, status, page: result.page - 1 })}>
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
              <Link href={pageHref({ query, letter, status, page: result.page + 1 })}>
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
