import { AppMessage } from "@/components/app-message"
import { DrugForm } from "@/components/admin/drug-form"
import { db } from "@/lib/db"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewDrugPage({ searchParams }: PageProps) {
  const params = await searchParams
  const reviewers = await db.user.findMany({
    where: {
      role: "PHARMACIST",
      pharmacistProfile: { is: { verificationStatus: "VERIFIED" } },
    },
    select: {
      id: true,
      name: true,
      email: true,
      pharmacistProfile: { select: { title: true } },
    },
    orderBy: { name: "asc" },
  })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Informasi Obat</p>
        <h1 className="text-2xl font-semibold">Tambah Obat</h1>
      </header>
      <DrugForm reviewers={reviewers} />
    </main>
  )
}
