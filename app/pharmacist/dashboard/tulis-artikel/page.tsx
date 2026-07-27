import Link from "next/link"
import { EyeIcon, PencilIcon, PlusIcon, XIcon } from "lucide-react"

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
import { articleStatusLabels, getArticles, type ArticleStatus } from "@/lib/articles"
import { requireRole } from "@/lib/session"
import { cn } from "@/lib/utils"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const statusOptions = ["ALL", "DRAFT", "PUBLISHED", "REJECTED"] as const
type StatusFilter = (typeof statusOptions)[number]
const filterLabels = {
  ALL: "Semua",
  DRAFT: "Menunggu",
  PUBLISHED: "Terbit",
  REJECTED: "Ditolak",
} satisfies Record<StatusFilter, string>

function parseStatus(value: string | string[] | undefined): StatusFilter {
  return typeof value === "string" && statusOptions.includes(value as StatusFilter)
    ? (value as StatusFilter)
    : "ALL"
}

function formatDate(date: Date | null) {
  if (!date) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function StatusPill({ status }: { status: ArticleStatus }) {
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
      {articleStatusLabels[status]}
    </span>
  )
}

export default async function PharmacistArticlesPage({ searchParams }: PageProps) {
  const [user, params] = await Promise.all([requireRole("PHARMACIST"), searchParams])
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const status = parseStatus(params?.status)
  const result = await getArticles({
    authorId: user.id,
    query,
    status,
  })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Apoteker</p>
          <h1 className="text-2xl font-semibold tracking-tight">Tulis Artikel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.articles.length} dari {result.total} artikel
          </p>
        </div>
        <Button asChild>
          <Link href="/pharmacist/dashboard/tulis-artikel/new">
            <PlusIcon data-icon="inline-start" />
            Tulis Artikel
          </Link>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Status Verifikasi</CardTitle>
          <CardDescription>Artikel yang pernah Anda submit ke admin.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
            <DebouncedSearchInput
              action="/pharmacist/dashboard/tulis-artikel"
              query={query}
              placeholder="Cari artikel atau kategori"
              ariaLabel="Cari artikel"
              hiddenParams={{ status: status !== "ALL" ? status : undefined }}
              inputGroupClassName="h-11 bg-background shadow-sm"
            />
            <SubmissionStatusFilter labels={filterLabels} options={statusOptions} status={status} />
            {query || status !== "ALL" ? (
              <Button asChild variant="ghost" size="icon" aria-label="Hapus filter">
                <Link href="/pharmacist/dashboard/tulis-artikel">
                  <XIcon />
                </Link>
              </Button>
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan admin</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.articles.length ? (
                result.articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>
                      <StatusPill status={article.status} />
                    </TableCell>
                    <TableCell className="max-w-sm text-muted-foreground">
                      {article.adminNote || "-"}
                    </TableCell>
                    <TableCell>{formatDate(article.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button asChild variant="outline" size="icon-sm" aria-label="Preview">
                          <Link href={`/pharmacist/dashboard/tulis-artikel/${article.id}`}>
                            <EyeIcon />
                          </Link>
                        </Button>
                        {article.status === "REJECTED" ? (
                          <Button asChild variant="destructive" size="icon-sm" aria-label="Perbaiki">
                            <Link href={`/pharmacist/dashboard/tulis-artikel/${article.id}/edit`}>
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
                    {query || status !== "ALL" ? "Artikel tidak ditemukan." : "Belum ada artikel."}
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
