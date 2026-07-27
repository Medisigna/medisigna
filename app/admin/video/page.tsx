import Link from "next/link"
import { EyeIcon, XIcon } from "lucide-react"

import { publishVideo } from "@/app/actions/admin/publish-video"
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
import { getVideos, videoStatusLabels, type VideoStatus } from "@/lib/educational-videos"
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

function StatusPill({ status }: { status: VideoStatus }) {
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
      {videoStatusLabels[status]}
    </span>
  )
}

export default async function AdminVideosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = typeof params?.q === "string" ? params.q.trim() : ""
  const status = parseStatus(params?.status)
  const result = await getVideos({ query, status })

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AppMessage error={params?.error} success={params?.success} />
      <header>
        <p className="text-sm text-muted-foreground">Dashboard Admin</p>
        <h1 className="text-2xl font-semibold">Video Edukasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review, terbitkan, atau tolak video apoteker. {result.videos.length} dari {result.total} video
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-md border bg-card p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
          <DebouncedSearchInput
            action="/admin/video"
            query={query}
            placeholder="Cari video atau kategori"
            ariaLabel="Cari video"
            hiddenParams={{ status: status !== "ALL" ? status : undefined }}
            inputGroupClassName="h-11 bg-background shadow-sm"
          />
          <SubmissionStatusFilter labels={filterLabels} options={statusOptions} status={status} />
          {query || status !== "ALL" ? (
            <Button asChild variant="ghost" size="icon" aria-label="Hapus filter">
              <Link href="/admin/video">
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
            {result.videos.length ? (
              result.videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>
                    <StatusPill status={video.status} />
                  </TableCell>
                  <TableCell>{video.authorName}</TableCell>
                  <TableCell>{video.category}</TableCell>
                  <TableCell>{formatDate(video.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Button asChild variant="ghost" size="icon-sm" aria-label="Preview">
                        <Link href={`/admin/video/${video.id}`}>
                          <EyeIcon />
                        </Link>
                      </Button>
                      {video.status === "PUBLISHED" ? null : (
                        <>
                          <form id={`publish-video-list-${video.id}`} action={publishVideo}>
                            <input type="hidden" name="id" value={video.id} />
                          </form>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button type="button" size="sm">
                                Terbitkan
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Terbitkan video?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Video akan tampil di halaman publik setelah diterbitkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  type="submit"
                                  name="action"
                                  value="publish"
                                  form={`publish-video-list-${video.id}`}
                                >
                                  Terbitkan
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      <form id={`reject-video-list-${video.id}`} action={publishVideo}>
                        <input type="hidden" name="id" value={video.id} />
                      </form>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm">
                            Tolak
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tolak Video</DialogTitle>
                            <DialogDescription>
                              Catatan ini akan terlihat oleh apoteker penulis.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col gap-2">
                            <label
                              htmlFor={`admin-note-list-${video.id}`}
                              className="text-sm font-medium"
                            >
                              Catatan penolakan
                            </label>
                            <Textarea
                              id={`admin-note-list-${video.id}`}
                              name="adminNote"
                              form={`reject-video-list-${video.id}`}
                              defaultValue={video.adminNote ?? ""}
                              required
                              rows={4}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              name="action"
                              value="reject"
                              form={`reject-video-list-${video.id}`}
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
                  Video tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </main>
  )
}
