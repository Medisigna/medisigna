import { notFound } from "next/navigation"

import { publishArticle } from "@/app/actions/admin/publish-article"
import { AppMessage } from "@/components/app-message"
import { ArticleDetailView } from "@/components/articles/article-detail"
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
import { Textarea } from "@/components/ui/textarea"
import { articleStatusLabels, getArticleById, type ArticleStatus } from "@/lib/articles"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminArticleReviewPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const article = await getArticleById(id)
  if (!article) notFound()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AppMessage error={query?.error} success={query?.success} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Artikel</p>
          <h1 className="text-2xl font-semibold">{article.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {articleStatusLabels[article.status as ArticleStatus]} · {article.authorName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {article.status === "PUBLISHED" ? null : (
            <>
              <form id={`publish-article-${article.id}`} action={publishArticle}>
                <input type="hidden" name="id" value={article.id} />
              </form>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button">Terbitkan</Button>
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
                      form={`publish-article-${article.id}`}
                    >
                      Terbitkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <form id={`reject-article-${article.id}`} action={publishArticle}>
            <input type="hidden" name="id" value={article.id} />
          </form>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
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
                <label htmlFor={`admin-note-${article.id}`} className="text-sm font-medium">
                  Catatan penolakan
                </label>
                <Textarea
                  id={`admin-note-${article.id}`}
                  name="adminNote"
                  form={`reject-article-${article.id}`}
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
                  form={`reject-article-${article.id}`}
                  variant="outline"
                >
                  Tolak
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <ArticleDetailView article={article} backHref="/admin/artikel" backLabel="Kembali ke Artikel" />
    </main>
  )
}
