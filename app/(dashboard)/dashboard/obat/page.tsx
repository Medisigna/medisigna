import { DrugList } from "@/components/drugs/drug-list"
import { filterDrugs } from "@/lib/drug-search"
import { getPublishedDrugs } from "@/lib/drugs"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardDrugPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const drugs = filterDrugs(await getPublishedDrugs(), query)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
      <DrugList
        drugs={drugs}
        query={query}
        action="/dashboard/obat"
        detailBasePath="/dashboard/obat"
      />
    </main>
  )
}
