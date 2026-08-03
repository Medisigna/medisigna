"use client"

import { type ReactNode, useState, useTransition } from "react"
import { FlagIcon } from "lucide-react"
import toast from "react-hot-toast"

import { reportForumContent } from "@/app/actions/forum/report-content"
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

export function ForumReportDialog({
  onOpenChange,
  open,
  targetId,
  targetType,
  trigger,
}: {
  onOpenChange?: (open: boolean) => void
  open?: boolean
  targetId: string
  targetType: "THREAD" | "POST"
  trigger?: ReactNode | null
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()
  const dialogOpen = open ?? internalOpen

  function setDialogOpen(nextOpen: boolean) {
    if (onOpenChange) {
      onOpenChange(nextOpen)
      return
    }

    setInternalOpen(nextOpen)
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await reportForumContent(formData)
      if (!result.ok) {
        toast.error(result.error ?? "Laporan gagal dikirim.")
        return
      }

      toast.success("Laporan dikirim.")
      setReason("")
      setDialogOpen(false)
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger === null ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button type="button" variant="ghost" size="sm">
              <FlagIcon data-icon="inline-start" />
              Laporkan
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Laporkan konten</DialogTitle>
          <DialogDescription>
            Laporan akan masuk ke antrian moderasi admin.
          </DialogDescription>
        </DialogHeader>
        <form action={submit} className="flex flex-col gap-4">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Alasan
            <Textarea
              name="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              rows={4}
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Mengirim..." : "Kirim laporan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
