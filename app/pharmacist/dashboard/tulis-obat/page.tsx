import Link from "next/link"
import { ExternalLinkIcon, PlusIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"
import type { DrugStatus } from "@/lib/drugs"
import { requireRole } from "@/lib/session"
import { cn } from "@/lib/utils"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type Submission = {
  id: string
  slug: string
  genericName: string
  status: DrugStatus
  adminNote: string | null
  createdAt: Date
  updatedAt: Date
}

const statusLabels = {
  DRAFT: "Menunggu",
  PUBLISHED: "Diterima",
  REJECTED: "Ditolak",
} satisfies Record<DrugStatus, string>

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function StatusPill({ status }: { status: DrugStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2 py-1 text-xs font-medium",
        status === "PUBLISHED"
          ? "bg-primary text-primary-foreground"
          : status === "REJECTED"
            ? "bg-destructive text-destructive-foreground"
            : "bg-secondary text-secondary-foreground"
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

export default async function PharmacistDrugSubmissionsPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([requireRole("PHARMACIST"), searchParams])
  const submissions: Submission[] = await db.$queryRaw`
    SELECT
      id,
      slug,
      "genericName",
      status::text AS status,
      "adminNote",
      "createdAt",
      "updatedAt"
    FROM "DrugInformation"
    WHERE "reviewerId" = ${user.id}
    ORDER BY "updatedAt" DESC
  `

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Apoteker</p>
          <h1 className="text-2xl font-semibold tracking-tight">Tulis Obat</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {submissions.length} tulisan obat
          </p>
        </div>
        <Button asChild>
          <Link href="/pharmacist/dashboard/tulis-obat/new">
            <PlusIcon data-icon="inline-start" />
            Tulis Obat
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Status Verifikasi</CardTitle>
          <CardDescription>Obat yang pernah Anda submit ke admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama obat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan admin</TableHead>
                <TableHead>Submit</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length ? (
                submissions.map((drug: Submission) => (
                  <TableRow key={drug.id}>
                    <TableCell className="font-medium">{drug.genericName}</TableCell>
                    <TableCell>
                      <StatusPill status={drug.status} />
                    </TableCell>
                    <TableCell className="max-w-sm text-muted-foreground">
                      {drug.adminNote || "-"}
                    </TableCell>
                    <TableCell>{formatDate(drug.createdAt)}</TableCell>
                    <TableCell>{formatDate(drug.updatedAt)}</TableCell>
                    <TableCell>
                      {drug.status === "PUBLISHED" ? (
                        <Button asChild variant="ghost" size="icon-sm" aria-label="Buka">
                          <Link href={`/pharmacist/dashboard/obat/${drug.slug}`}>
                            <ExternalLinkIcon />
                          </Link>
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Belum ada tulisan obat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
