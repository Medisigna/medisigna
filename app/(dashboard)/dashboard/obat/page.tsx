import { parseAlphabetLetter } from "@/components/drugs/alphabet-filter"
import { DrugList } from "@/components/drugs/drug-list"
import { getPublishedDrugs } from "@/lib/drugs"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function parsePage(value: string | string[] | undefined) {
  if (typeof value !== "string") return 1

  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

export default async function DashboardDrugPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const letter = parseAlphabetLetter(params?.letter)
  const page = parsePage(params?.page)
  const result = await getPublishedDrugs({ query, letter, page })

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
      <DrugList
        result={result}
        query={query}
        letter={letter}
        action="/dashboard/obat"
        detailBasePath="/dashboard/obat"
      />
    </main>
  )
}
