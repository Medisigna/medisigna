import Link from "next/link"
import { notFound } from "next/navigation"
import { PencilIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { PharmacistDrugDetail } from "@/components/drugs/pharmacist-drug-detail"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPharmacistDrugSubmission } from "@/lib/pharmacist-drug-submissions"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function statusLabel(status: string, revisesDrugId: string | null) {
  if (revisesDrugId && status === "DRAFT") return "Revisi menunggu"
  if (revisesDrugId && status === "REJECTED") return "Revisi ditolak"
  if (status === "PUBLISHED") return "Diterima"
  if (status === "REJECTED") return "Ditolak"
  return "Menunggu"
}

export default async function PharmacistSubmissionPreviewPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireRole("PHARMACIST"),
  ])
  const drug = await getPharmacistDrugSubmission(id, user.id)
  if (!drug) notFound()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <AppMessage error={query?.error} success={query?.success} />
      <Card className="rounded-[1.75rem] border-0 bg-card shadow-none ring-0">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <CardTitle>{statusLabel(drug.status, drug.revisesDrugId)}</CardTitle>
          </div>
          {drug.status === "REJECTED" ? (
            <Button asChild variant="outline">
              <Link href={`/pharmacist/dashboard/tulis-obat/${drug.id}/edit`}>
                <PencilIcon data-icon="inline-start" />
                Perbaiki
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        {drug.adminNote ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">{drug.adminNote}</p>
          </CardContent>
        ) : null}
      </Card>
      <PharmacistDrugDetail
        drug={drug}
        backHref="/pharmacist/dashboard/tulis-obat"
        backLabel="Kembali ke Tulis Obat"
      />
    </main>
  )
}
