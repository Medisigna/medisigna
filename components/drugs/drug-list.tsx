import Link from "next/link"
import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react"

import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { AlphabetFilter } from "@/components/drugs/alphabet-filter"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DrugListResult } from "@/lib/drugs"
import { cn } from "@/lib/utils"

function getDrugMeta({
  brandNames,
  aliases,
}: {
  brandNames: string[]
  aliases: string[]
}) {
  const names = brandNames.length ? brandNames : aliases
  if (!names.length) return "Nama generik"

  return names.slice(0, 3).join(", ")
}

export function DrugList({
  result,
  query,
  letter,
  action,
  detailBasePath,
  bordered = true,
  variant = "default",
}: {
  result: DrugListResult
  query: string
  letter: string
  action: string
  detailBasePath: string
  bordered?: boolean
  variant?: "default" | "soft"
}) {
  const { drugs, page, total, hasPreviousPage, hasNextPage } = result
  const isSoft = variant === "soft"
  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (letter) params.set("letter", letter)
    params.set("page", String(nextPage))

    return `${action}?${params.toString()}`
  }
  const letterHref = (nextLetter: string) => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (nextLetter !== letter) params.set("letter", nextLetter)

    return params.size ? `${action}?${params.toString()}` : action
  }

  return (
    <section className="flex flex-col gap-6">
      <div className={cn(isSoft && "px-2 py-2 md:px-1")}>
        <h1 className="text-2xl font-semibold tracking-tight text-secondary-foreground">
          {query ? `Hasil untuk "${query}"` : "Daftar obat"}
        </h1>
        {!isSoft ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {drugs.length} dari {total} informasi
          </p>
        ) : null}
      </div>

      <form
        action={action}
        role="search"
        className="flex w-full max-w-xl items-center gap-2"
      >
        <DebouncedSearchInput
          action={action}
          query={query}
          placeholder="Cari nama obat, merek, atau alias"
          ariaLabel="Cari obat"
          hiddenParams={{ letter }}
          inputGroupClassName={cn(
            "h-11 rounded-2xl",
            isSoft
              ? "border-0 bg-card shadow-none ring-0"
              : "bg-background shadow-sm"
          )}
        />
        {query || letter ? (
          <Button
            asChild
            variant="ghost"
            size="icon-sm"
            aria-label="Hapus pencarian"
          >
            <Link href={action}>
              <XIcon />
            </Link>
          </Button>
        ) : null}
      </form>

      <AlphabetFilter
        activeLetter={letter}
        hrefForLetter={letterHref}
        variant={variant}
      />

      {drugs.length ? (
        <div className="grid max-w-4xl gap-4">
          {drugs.map((drug) => (
            <Link
              key={drug.id}
              href={`${detailBasePath}/${drug.slug}`}
              className="group block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card
                className={cn(
                  "h-full bg-card py-4 shadow-none ring-0 transition-colors",
                  isSoft
                    ? "rounded-[1.75rem] border-0 group-hover:bg-card/80"
                    : "rounded-xl group-hover:bg-muted/40",
                  bordered && "border border-border/70"
                )}
              >
                <CardHeader className="gap-1.5">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-left text-lg leading-snug">
                      {drug.genericName}
                    </CardTitle>
                    <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                  <CardDescription className="line-clamp-1 text-left">
                    {getDrugMeta(drug)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {drug.uses}
                  </p>
                </CardContent>
                <CardFooter className="pt-1">
                  <span className="text-sm font-medium text-primary">
                    Lihat detail
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card
          className={cn(
            isSoft &&
              "rounded-[1.75rem] border border-dashed border-border/70 bg-card shadow-none ring-0"
          )}
        >
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <SearchIcon className="size-6" />
            </div>
            <div>
              <p className="font-medium">Informasi obat tidak ditemukan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coba gunakan nama generik, merek, atau istilah lain.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={action}>Lihat semua obat</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {total ? (
        <div className="flex items-center justify-between gap-3">
          {hasPreviousPage ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page - 1)}>Sebelumnya</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Sebelumnya
            </Button>
          )}
          <p className="text-sm text-muted-foreground">Halaman {page}</p>
          {hasNextPage ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page + 1)}>Berikutnya</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Berikutnya
            </Button>
          )}
        </div>
      ) : null}

      <Card
        className={cn(
          "shadow-none",
          isSoft
            ? "rounded-[1.75rem] border-0 bg-card ring-0"
            : "border-primary/20 bg-primary/5"
        )}
      >
        <CardHeader>
          <CardTitle>Catatan penting</CardTitle>
          <CardDescription className="leading-6">
            Konten pada fitur ini adalah data demo yang belum menjadi rujukan
            klinis produksi. Informasi obat tidak menggantikan pemeriksaan,
            diagnosis, resep, atau arahan tenaga kesehatan.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  )
}
