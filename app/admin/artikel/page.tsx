import Link from "next/link"
import { EyeIcon, XIcon } from "lucide-react"

import { publishArticle } from "@/app/actions/admin/publish-article"
import { AppMessage } from "@/components/app-message"
import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { SubmissionStatusFilter } from "@/components/pharmacist/submission-status-filter"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { articleStatusLabels, getArticles, type ArticleStatus } from "@/lib/articles"
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

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const status = parseStatus(params?.status)
  const result = await getArticles({ query, status })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Dashboard Admin</p>
        <h1 className="text-2xl font-semibold">Artikel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, terbitkan, atau tolak artikel apoteker. {result.articles.length} dari {result.total} artikel
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-md border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
          <DebouncedSearchInput
            action="/admin/artikel"
            query={query}
            placeholder="Cari artikel atau kategori"
            ariaLabel="Cari artikel"
            hiddenParams={{ status: status !== "ALL" ? status : undefined }}
            inputGroupClassName="h-11 bg-background shadow-sm"
          />
          <SubmissionStatusFilter labels={filterLabels} options={statusOptions} status={status} />
          {query || status !== "ALL" ? (
            <Button asChild variant="ghost" size="icon" aria-label="Hapus filter">
              <Link href="/admin/artikel">
                <XIcon />
              </Link>
            </Button>
          ) : null}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Penulis</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Update</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.articles.length ? (
              result.articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    <StatusPill status={article.status} />
                  </TableCell>
                  <TableCell>{article.authorName}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>{formatDate(article.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button asChild variant="ghost" size="icon-sm" aria-label="Preview">
                        <Link href={`/admin/artikel/${article.id}`}>
                          <EyeIcon />
                        </Link>
                      </Button>
                      {article.status === "PUBLISHED" ? null : (
                        <>
                          <form id={`publish-article-list-${article.id}`} action={publishArticle}>
                            <input type="hidden" name="id" value={article.id} />
                          </form>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" size="sm">
                                Terbitkan
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Terbitkan artikel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Artikel akan tampil di halaman publik setelah diterbitkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  type="submit"
                                  name="action"
                                  value="publish"
                                  form={`publish-article-list-${article.id}`}
                                >
                                  Terbitkan
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      <form id={`reject-article-list-${article.id}`} action={publishArticle}>
                        <input type="hidden" name="id" value={article.id} />
                      </form>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            Tolak
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tolak Artikel</DialogTitle>
                            <DialogDescription>
                              Catatan ini akan terlihat oleh apoteker penulis.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor={`admin-note-list-${article.id}`}
                              className="text-sm font-medium"
                            >
                              Catatan penolakan
                            </label>
                            <Textarea
                              id={`admin-note-list-${article.id}`}
                              name="adminNote"
                              form={`reject-article-list-${article.id}`}
                              defaultValue={article.adminNote ?? ""}
                              required
                              rows={4}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              name="action"
                              value="reject"
                              form={`reject-article-list-${article.id}`}
                              variant="outline"
                            >
                              Tolak
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Artikel tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
