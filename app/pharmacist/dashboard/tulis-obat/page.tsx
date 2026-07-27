import Link from "next/link"
import type { ReactNode } from "react"
import { Prisma } from "@prisma/client"
import { ExternalLinkIcon, EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, XIcon } from "lucide-react"

import { requestDrugRevision } from "@/app/actions/pharmacist/save-drug"
import { AppMessage } from "@/components/app-message"
import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { SubmissionStatusFilter } from "@/components/pharmacist/submission-status-filter"
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
  revisesDrugId: string | null
  createdAt: Date
  updatedAt: Date
}

const statusLabels = {
  DRAFT: "Menunggu",
  PUBLISHED: "Diterima",
  REJECTED: "Ditolak",
  ARCHIVED: "Diarsipkan",
} satisfies Record<DrugStatus, string>

const statusOptions = [
  "ALL",
  "DRAFT",
  "PUBLISHED",
  "REJECTED",
  "REVISION_DRAFT",
  "REVISION_REJECTED",
] as const

type StatusFilter = (typeof statusOptions)[number]

const filterLabels = {
  ALL: "Semua",
  DRAFT: "Menunggu",
  PUBLISHED: "Diterima",
  REJECTED: "Ditolak",
  REVISION_DRAFT: "Revisi menunggu",
  REVISION_REJECTED: "Revisi ditolak",
} satisfies Record<StatusFilter, string>

function submissionStatusLabel(submission: Submission) {
  if (submission.revisesDrugId && submission.status === "DRAFT") return "Revisi menunggu"
  if (submission.revisesDrugId && submission.status === "REJECTED") return "Revisi ditolak"
  return statusLabels[submission.status]
}

function parseStatusFilter(value: string | string[] | undefined): StatusFilter {
  return typeof value === "string" && statusOptions.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "ALL"
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function StatusPill({ children, status }: { children: ReactNode; status: DrugStatus }) {
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
      {children}
    </span>
  )
}

export default async function PharmacistDrugSubmissionsPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([requireRole("PHARMACIST"), searchParams])
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const status = parseStatusFilter(params?.status)
  const likeQuery = `%${query}%`
  const searchCondition = query
    ? Prisma.sql`
      AND (
        "genericName" ILIKE ${likeQuery}
        OR EXISTS (
          SELECT 1
          FROM unnest("brandNames") AS brand_name(name)
          WHERE brand_name.name ILIKE ${likeQuery}
        )
        OR EXISTS (
          SELECT 1
          FROM unnest(aliases) AS alias_name(name)
          WHERE alias_name.name ILIKE ${likeQuery}
        )
      )
    `
    : Prisma.empty
  const statusCondition =
    status === "DRAFT"
      ? Prisma.sql`AND status::text = 'DRAFT' AND "revisesDrugId" IS NULL`
      : status === "PUBLISHED"
        ? Prisma.sql`AND status::text = 'PUBLISHED'`
        : status === "REJECTED"
          ? Prisma.sql`AND status::text = 'REJECTED' AND "revisesDrugId" IS NULL`
          : status === "REVISION_DRAFT"
            ? Prisma.sql`AND status::text = 'DRAFT' AND "revisesDrugId" IS NOT NULL`
            : status === "REVISION_REJECTED"
              ? Prisma.sql`AND status::text = 'REJECTED' AND "revisesDrugId" IS NOT NULL`
              : Prisma.empty
  const submissions: Submission[] = await db.$queryRaw`
    SELECT
      id,
      slug,
      "genericName",
      status::text AS status,
      "adminNote",
      "revisesDrugId",
      "createdAt",
      "updatedAt"
    FROM "DrugInformation"
    WHERE "reviewerId" = ${user.id}
      AND status::text <> 'ARCHIVED'
      ${searchCondition}
      ${statusCondition}
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
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_auto]">
            <DebouncedSearchInput
              action="/pharmacist/dashboard/tulis-obat"
              query={query}
              placeholder="Cari obat, merek, atau alias"
              ariaLabel="Cari tulisan obat"
              hiddenParams={{ status: status !== "ALL" ? status : undefined }}
              inputGroupClassName="h-11 bg-background shadow-sm"
            />
            <SubmissionStatusFilter labels={filterLabels} options={statusOptions} status={status} />
            {query || status !== "ALL" ? (
              <Button asChild variant="ghost" size="icon" aria-label="Hapus filter">
                <Link href="/pharmacist/dashboard/tulis-obat">
                  <XIcon />
                </Link>
              </Button>
            ) : null}
          </div>
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
                      <StatusPill status={drug.status}>{submissionStatusLabel(drug)}</StatusPill>
                    </TableCell>
                    <TableCell className="max-w-sm text-muted-foreground">
                      {drug.adminNote || "-"}
                    </TableCell>
                    <TableCell>{formatDate(drug.createdAt)}</TableCell>
                    <TableCell>{formatDate(drug.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {drug.status === "PUBLISHED" ? (
                          <>
                            <Button asChild variant="secondary" size="icon-sm" aria-label="Lihat obat">
                              <Link href={`/pharmacist/dashboard/obat/${drug.slug}`}>
                                <ExternalLinkIcon />
                              </Link>
                            </Button>
                            <form action={requestDrugRevision}>
                              <input type="hidden" name="id" value={drug.id} />
                              <Button type="submit" size="sm">
                                <RefreshCwIcon data-icon="inline-start" />
                                Ajukan Revisi
                              </Button>
                            </form>
                          </>
                        ) : (
                          <Button asChild variant="outline" size="icon-sm" aria-label="Preview">
                            <Link href={`/pharmacist/dashboard/tulis-obat/${drug.id}`}>
                              <EyeIcon />
                            </Link>
                          </Button>
                        )}
                        {drug.status === "REJECTED" ? (
                          <Button asChild variant="destructive" size="icon-sm" aria-label="Perbaiki">
                            <Link href={`/pharmacist/dashboard/tulis-obat/${drug.id}/edit`}>
                              <PencilIcon />
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {query || status !== "ALL"
                      ? "Tulisan obat tidak ditemukan."
                      : "Belum ada tulisan obat."}
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
