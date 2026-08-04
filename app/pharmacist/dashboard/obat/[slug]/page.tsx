import { notFound } from "next/navigation"

import { PharmacistDrugDetail } from "@/components/drugs/pharmacist-drug-detail"
import { getPharmacistDrug } from "@/lib/drugs"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function PharmacistDrugDetailPage({ params }: PageProps) {
  const drug = await getPharmacistDrug((await params).slug)
  if (!drug) notFound()

  return (
    <main className="mx-auto w-full max-w-6xl py-4 md:py-6">
      <PharmacistDrugDetail drug={drug} />
    </main>
  )
}
