import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DrugDetail } from "@/components/drugs/drug-detail"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { getPublishedDrug } from "@/lib/drugs"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const drug = await getPublishedDrug((await params).slug)

  if (!drug) {
    return { title: "Informasi Obat Tidak Ditemukan | Medisigna" }
  }

  return {
    title: `${drug.genericName} — Informasi Obat | Medisigna`,
    description: drug.uses,
  }
}

export default async function DrugDetailPage({ params }: PageProps) {
  const drug = await getPublishedDrug((await params).slug)
  if (!drug) notFound()

  return (
    <main className="flex min-h-svh flex-col bg-muted/30">
      <SiteHeader />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 md:py-12">
        <DrugDetail
          drug={drug}
          backHref="/obat"
          pharmacistsHref="/pharmacists"
        />
      </div>
      <SiteFooter />
    </main>
  )
}
