import { notFound } from "next/navigation"

import { DrugDetail } from "@/components/drugs/drug-detail"
import { getPublishedDrug } from "@/lib/drugs"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function DashboardDrugDetailPage({ params }: PageProps) {
  const drug = await getPublishedDrug((await params).slug)
  if (!drug) notFound()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-5 md:px-6 md:py-8">
      <DrugDetail
        drug={drug}
        backHref="/dashboard/obat"
        pharmacistsHref="/dashboard/pharmacists"
      />
    </main>
  )
}
