"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2Icon,
  ClipboardPenLineIcon,
  FileTextIcon,
  FlagIcon,
  SparklesIcon,
} from "lucide-react"
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
      <DialogContent className="max-h-[calc(100svh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="relative overflow-hidden border-b bg-primary/5 p-6 pr-14">
          <div className="absolute -top-12 -right-8 size-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="mb-2 flex size-11 rotate-3 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ClipboardPenLineIcon className="size-5" aria-hidden="true" />
          </div>
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-primary uppercase">
            <SparklesIcon className="size-3" aria-hidden="true" />
            Catatan akhir
          </p>
          <DialogTitle className="text-xl">
            {summary ? "Ringkasan Sesi" : "Selesaikan Konsultasi"}
          </DialogTitle>
          <DialogDescription>
            Buat catatan singkat agar pasien mudah mengingat hasil konsultasi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 overflow-y-auto p-6">
          <input type="hidden" name="sessionId" value={sessionId} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="flex items-center gap-2">
              <FlagIcon className="size-4 text-primary" aria-hidden="true" />
              Topik utama
            </span>
            <div className="rounded-xl bg-muted/40 p-1">
              <Input
                name="title"
                required
                disabled={disabled || isSaving}
                defaultValue={summary?.mainProblem ?? ""}
                placeholder="Contoh: Penggunaan antibiotik"
                className="bg-background"
              />
            </div>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="flex items-center gap-2">
              <FileTextIcon className="size-4 text-primary" aria-hidden="true" />
              Catatan untuk pasien
            </span>
            <div className="rounded-xl bg-muted/40 p-1">
              <Textarea
                name="description"
                required
                disabled={disabled || isSaving}
                defaultValue={summary?.education ?? ""}
                placeholder="Tulis aturan pakai, hal yang perlu diperhatikan, dan saran lanjutan..."
                className="min-h-32 bg-background"
              />
            </div>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Status akhir
            <select
              name="status"
              disabled={disabled || isSaving}
              defaultValue={summary?.finalStatus ?? "COMPLETED"}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="COMPLETED">Selesai</option>
              <option value="REFERRED">Dirujuk ke Faskes</option>
            </select>
          </label>
          <DialogFooter className="border-t pt-5">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={disabled || isSaving}>
              <CheckCircle2Icon data-icon="inline-start" />
              {isSaving ? "Menyimpan..." : "Simpan dan Tutup Sesi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
