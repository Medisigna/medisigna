import { notFound } from "next/navigation"

import { savePharmacistDrug } from "@/app/actions/pharmacist/save-drug"
import { DrugForm } from "@/components/admin/drug-form"
import { AppMessage } from "@/components/app-message"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPharmacistDrugSubmission } from "@/lib/pharmacist-drug-submissions"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditPharmacistSubmissionPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireRole("PHARMACIST"),
  ])
  const drug = await getPharmacistDrugSubmission(id, user.id)
  const canEdit = drug?.status === "REJECTED" || (drug?.revisesDrugId && drug.status === "DRAFT")
  if (!drug || !canEdit) notFound()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <AppMessage error={query?.error} success={query?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Tulis Obat</p>
        <h1 className="text-2xl font-semibold">
          {drug.revisesDrugId
            ? drug.status === "DRAFT"
              ? "Ajukan Revisi"
              : "Perbaiki Revisi"
            : "Perbaiki Tulisan Obat"}
        </h1>
      </header>
      {drug.adminNote ? (
        <Card>
          <CardHeader>
            <CardTitle>Catatan admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{drug.adminNote}</p>
          </CardContent>
        </Card>
      ) : null}
      <DrugForm
        drug={drug}
        mode="pharmacist"
        saveAction={savePharmacistDrug}
        cancelHref={`/pharmacist/dashboard/tulis-obat/${drug.id}`}
        lockIdentity={Boolean(drug.revisesDrugId)}
      />
    </main>
  )
}
