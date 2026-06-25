import Link from "next/link"
import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { DrugListItem } from "@/lib/drugs"

export function DrugList({
  drugs,
  query,
  action,
  detailBasePath,
}: {
  drugs: DrugListItem[]
  query: string
  action: string
  detailBasePath: string
}) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {query ? `Hasil untuk “${query}”` : "Daftar obat"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {drugs.length} informasi ditemukan
        </p>
      </div>

      <form
        action={action}
        role="search"
        className="flex w-full max-w-xl items-center gap-2"
      >
        <InputGroup className="h-11 rounded-2xl bg-background shadow-sm">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Cari nama obat, merek, atau alias"
            aria-label="Cari obat"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="submit">Cari</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {query ? (
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

      {drugs.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {drugs.map((drug) => (
            <Card
              key={drug.id}
              className="rounded-3xl bg-card py-5 shadow-none ring-0 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-left text-xl">
                  {drug.genericName}
                </CardTitle>
                <CardDescription className="text-left">
                  {drug.brandNames.length
                    ? drug.brandNames.join(" · ")
                    : "Nama generik"}
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-end">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`${detailBasePath}/${drug.slug}`}>
                    Lihat detail
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
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

      <Card className="border-primary/20 bg-primary/5 shadow-none">
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
