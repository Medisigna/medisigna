import type { Metadata } from "next"

import { DrugList } from "@/components/drugs/drug-list"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { filterDrugs } from "@/lib/drug-search"
import { getPublishedDrugs } from "@/lib/drugs"

export const metadata: Metadata = {
  title: "Informasi Obat | Medisigna",
  description:
    "Cari contoh informasi umum obat dalam bahasa yang mudah dipahami.",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function DrugInformationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const drugs = filterDrugs(await getPublishedDrugs(), query)

  return (
    <main className="flex min-h-svh flex-col bg-muted-foreground/5">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-12">
        <DrugList
          drugs={drugs}
          query={query}
          action="/obat"
          detailBasePath="/obat"
        />
      </div>
      <SiteFooter />
    </main>
  )
}
