import { notFound } from "next/navigation"

import { publishVideo } from "@/app/actions/admin/publish-video"
import { AppMessage } from "@/components/app-message"
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
import { VideoDetailView } from "@/components/videos/video-detail"
import { getVideoById, videoStatusLabels, type VideoStatus } from "@/lib/educational-videos"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminVideoReviewPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const video = await getVideoById(id)
  if (!video) notFound()

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
      <AppMessage error={query?.error} success={query?.success} />
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Video Edukasi</p>
          <h1 className="text-2xl font-semibold">{video.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {videoStatusLabels[video.status as VideoStatus]} - {video.authorName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {video.status === "PUBLISHED" ? null : (
            <>
              <form id={`publish-video-${video.id}`} action={publishVideo}>
                <input type="hidden" name="id" value={video.id} />
              </form>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button">Terbitkan</Button>
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
                      form={`publish-video-${video.id}`}
                    >
                      Terbitkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <form id={`reject-video-${video.id}`} action={publishVideo}>
            <input type="hidden" name="id" value={video.id} />
          </form>
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
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
                <label htmlFor={`admin-note-${video.id}`} className="text-sm font-medium">
                  Catatan penolakan
                </label>
                <Textarea
                  id={`admin-note-${video.id}`}
                  name="adminNote"
                  form={`reject-video-${video.id}`}
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
                  form={`reject-video-${video.id}`}
                  variant="outline"
                >
                  Tolak
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <VideoDetailView video={video} backHref="/admin/video" backLabel="Kembali ke Video" />
    </main>
  )
}
