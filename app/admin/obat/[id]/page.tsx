import { notFound } from "next/navigation"

import { AppMessage } from "@/components/app-message"
import { DrugForm } from "@/components/admin/drug-form"
import { DrugDetail } from "@/components/drugs/drug-detail"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { getAdminDrug } from "@/lib/drugs"
import Link from "next/link"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function EditDrugPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const drug = await getAdminDrug(id)
  if (!drug) notFound()

  if (query?.preview === "public") {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link href={`/admin/obat/${drug.id}`}>Kembali edit</Link>
          </Button>
        </div>
        <DrugDetail
          drug={drug}
          backHref={`/admin/obat/${drug.id}`}
          pharmacistsHref="/dashboard/pharmacists"
        />
      </main>
    )
  }

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
      <AppMessage error={query?.error} success={query?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Informasi Obat</p>
        <h1 className="text-2xl font-semibold">{drug.genericName}</h1>
      </header>
      <DrugForm drug={drug} reviewers={reviewers} />
    </main>
  )
}
