import { savePharmacistDrug } from "@/app/actions/pharmacist/save-drug"
import { DrugForm } from "@/components/admin/drug-form"
import { AppMessage } from "@/components/app-message"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewPharmacistDrugPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 py-4 md:py-6">
      <AppMessage error={params?.error} success={params?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Tulis Obat</p>
        <h1 className="text-2xl font-semibold">Tambah Tulisan Obat</h1>
      </header>
      <DrugForm
        mode="pharmacist"
        saveAction={savePharmacistDrug}
        cancelHref="/pharmacist/dashboard/tulis-obat"
      />
    </main>
  )
}
