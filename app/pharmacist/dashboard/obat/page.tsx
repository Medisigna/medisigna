import Link from "next/link"
import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { AlphabetFilter, parseAlphabetLetter } from "@/components/drugs/alphabet-filter"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPharmacistDrugs } from "@/lib/drugs"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function parsePage(value: string | string[] | undefined) {
  if (typeof value !== "string") return 1

  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function pageHref(query: string, letter: string, page: number) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (letter) params.set("letter", letter)
  params.set("page", String(page))

  return `/pharmacist/dashboard/obat?${params.toString()}`
}

function letterHref(query: string, activeLetter: string, nextLetter: string) {
  const params = new URLSearchParams()
  if (query) params.set("q", query)
  if (nextLetter !== activeLetter) params.set("letter", nextLetter)

  return params.size ? `/pharmacist/dashboard/obat?${params.toString()}` : "/pharmacist/dashboard/obat"
}

function MetaBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
      {children}
    </span>
  )
}

export default async function PharmacistDrugPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const letter = parseAlphabetLetter(params?.letter)
  const page = parsePage(params?.page)
  const result = await getPharmacistDrugs({ query, letter, page })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <AppMessage error={params?.error} success={params?.success} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Informasi Obat</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Referensi Apoteker
          </h1>
          <p className="text-sm text-muted-foreground">
            {result.drugs.length} dari {result.total} informasi
          </p>
        </div>
      </header>

      <form
        action="/pharmacist/dashboard/obat"
        role="search"
        className="flex w-full max-w-xl items-center gap-2"
      >
        <DebouncedSearchInput
          action="/pharmacist/dashboard/obat"
          query={query}
          placeholder="Cari obat, merek, atau alias"
          ariaLabel="Cari obat"
          hiddenParams={{ letter }}
          inputGroupClassName="h-11 rounded-2xl border-0 bg-card shadow-none ring-0"
        />
        {query || letter ? (
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Hapus pencarian"
          >
            <Link href="/pharmacist/dashboard/obat">
              <XIcon />
            </Link>
          </Button>
        ) : null}
      </form>

        <AlphabetFilter
          activeLetter={letter}
          hrefForLetter={(nextLetter) => letterHref(query, letter, nextLetter)}
          variant="soft"
        />

      {result.drugs.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {result.drugs.map((drug) => (
            <Card
              key={drug.id}
              size="sm"
              className="rounded-[1.75rem] border-0 bg-card shadow-none ring-0"
            >
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {drug.drugClass ? <MetaBadge>{drug.drugClass}</MetaBadge> : null}
                  {drug.isDemo ? <MetaBadge>Konten demo</MetaBadge> : null}
                </div>
                <CardTitle className="text-xl">{drug.genericName}</CardTitle>
                <CardDescription>
                  {drug.brandNames.length
                    ? drug.brandNames.join(" - ")
                    : "Nama generik"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p className="line-clamp-2">{drug.uses}</p>
                <p>Review: {formatDate(drug.reviewedAt)}</p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/pharmacist/dashboard/obat/${drug.slug}`}>
                    Buka detail
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-[1.75rem] border-0 bg-card shadow-none ring-0">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <SearchIcon className="size-6" />
            </div>
            <div>
              <p className="font-medium">Informasi obat tidak ditemukan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coba nama generik, merek, atau alias lain.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/pharmacist/dashboard/obat">Lihat semua obat</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {result.total ? (
        <div className="flex items-center justify-between gap-3">
          {result.hasPreviousPage ? (
            <Button asChild variant="outline">
              <Link href={pageHref(query, letter, result.page - 1)}>Sebelumnya</Link>
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
              <Link href={pageHref(query, letter, result.page + 1)}>Berikutnya</Link>
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
