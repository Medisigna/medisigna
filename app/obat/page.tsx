import type { Metadata } from "next"

import { parseAlphabetLetter } from "@/components/drugs/alphabet-filter"
import { DrugList } from "@/components/drugs/drug-list"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { getPublishedDrugs } from "@/lib/drugs"

export const metadata: Metadata = {
  title: "Informasi Obat | Medisigna",
  description:
    "Cari contoh informasi umum obat dalam bahasa yang mudah dipahami.",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function parsePage(value: string | string[] | undefined) {
  if (typeof value !== "string") return 1

  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export default async function DrugInformationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const letter = parseAlphabetLetter(params?.letter)
  const page = parsePage(params?.page)
  const result = await getPublishedDrugs({ query, letter, page })

  return (
    <main className="flex min-h-svh flex-col bg-secondary">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-12">
        <DrugList
          result={result}
          query={query}
          letter={letter}
          action="/obat"
          detailBasePath="/obat"
          bordered={false}
          variant="soft"
        />
      </div>
      <SiteFooter />
    </main>
  )
}
