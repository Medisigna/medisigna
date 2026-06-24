"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon } from "lucide-react"
import toast from "react-hot-toast"

import { saveConsultationSummary } from "@/app/actions/consultation/save-summary"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type SummaryData = {
  mainProblem?: string | null
  education?: string | null
  finalStatus?: string | null
}

export function SummaryForm({
  sessionId,
  summary,
  disabled,
}: {
  sessionId: string
  summary?: SummaryData | null
  disabled?: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || isSaving) return

    setIsSaving(true)
    const result = await saveConsultationSummary(new FormData(event.currentTarget))
    setIsSaving(false)

    if (!result.ok) {
      toast.error(result.error ?? "Ringkasan gagal disimpan.")
      return
    }

    toast.success("Ringkasan tersimpan.")
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={summary ? "outline" : "default"}>
          <CheckCircle2Icon data-icon="inline-start" />
          {summary ? "Ringkasan Sesi" : "Tutup Sesi"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{summary ? "Ringkasan Sesi" : "Tutup Sesi"}</DialogTitle>
          <DialogDescription>
            Isi ringkasan konseling sebelum mengakhiri sesi pasien.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="sessionId" value={sessionId} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Judul
            <Input
              name="title"
              required
              disabled={disabled || isSaving}
              defaultValue={summary?.mainProblem ?? ""}
              placeholder="Contoh: Konseling penggunaan antibiotik"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Deskripsi
            <Textarea
              name="description"
              required
              disabled={disabled || isSaving}
              defaultValue={summary?.education ?? ""}
              placeholder="Tulis ringkasan hasil konseling..."
              className="min-h-28"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Status
            <select
              name="status"
              disabled={disabled || isSaving}
              defaultValue={summary?.finalStatus ?? "COMPLETED"}
              className="h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs disabled:opacity-50"
            >
              <option value="COMPLETED">Selesai</option>
              <option value="REFERRED">Dirujuk ke Faskes</option>
            </select>
          </label>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={disabled || isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan dan Tutup Sesi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
