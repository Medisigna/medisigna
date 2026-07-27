"use client"

import Link from "next/link"
import { type CSSProperties, type ReactNode, useState } from "react"

import { publishDrug } from "@/app/actions/admin/publish-drug"
import { saveDrug } from "@/app/actions/admin/save-drug"
import { DrugSubmitButton } from "@/components/admin/drug-submit-button"
import { MarkdownEditorField } from "@/components/markdown-editor-field"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AdminDrugDetailData } from "@/lib/drugs"
import { cn } from "@/lib/utils"

type SaveDrugAction = (formData: FormData) => void | Promise<void>

type Reviewer = {
  id: string
  name: string
  email: string
  pharmacistProfile: {
    title: string
  } | null
}

function lines(items?: string[]) {
  return items?.join("\n") ?? ""
}

function markdownList(items?: string[]) {
  return items?.length ? items.map((item) => `- ${item}`).join("\n") : ""
}

function dateInput(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : ""
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  )
}

function TextField({
  name,
  label,
  defaultValue,
  required,
  readOnly,
}: {
  name: string
  label: string
  defaultValue?: string | null
  required?: boolean
  readOnly?: boolean
}) {
  return (
    <Field label={label}>
      <Input
        name={name}
        defaultValue={defaultValue ?? ""}
        aria-required={required}
        readOnly={readOnly}
      />
    </Field>
  )
}

function TextAreaField({
  name,
  label,
  defaultValue,
  required,
  rows = 4,
}: {
  name: string
  label: string
  defaultValue?: string | null
  required?: boolean
  rows?: number
}) {
  return (
    <Field label={label}>
      <Textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        aria-required={required}
        rows={rows}
      />
    </Field>
  )
}

export function DrugForm({
  drug,
  reviewers: _reviewers = [],
  saveAction = saveDrug,
  mode = "admin",
  cancelHref = "/admin/obat",
  lockIdentity = false,
}: {
  drug?: AdminDrugDetailData | null
  reviewers?: Reviewer[]
  saveAction?: SaveDrugAction
  mode?: "admin" | "pharmacist"
  cancelHref?: string
  lockIdentity?: boolean
}) {
  const isAdmin = mode === "admin"
  const steps = [
    { id: "basic", title: "Dasar" },
    { id: "public", title: "Publik" },
    { id: "pharmacist", title: "Apoteker" },
    ...(isAdmin ? [{ id: "review", title: "Review" }] : []),
  ] as const
  const [activeStep, setActiveStep] = useState(0)
  const requiredNames = isAdmin
    ? ["genericName", "uses", "generalUsage", "reviewedAt"]
    : ["genericName", "uses", "generalUsage"]
  const isFinalStep = activeStep === steps.length - 1

  return (
    <div className="flex flex-col gap-4">
      {isAdmin && drug ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/obat/${drug.id}?preview=public`}>Preview admin</Link>
          </Button>
          {drug.status === "PUBLISHED" ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/obat/${drug.slug}`} target="_blank">
                Preview publik
              </Link>
            </Button>
          ) : (
            <>
              <form id={`publish-drug-${drug.id}`} action={publishDrug}>
                <input type="hidden" name="id" value={drug.id} />
              </form>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" size="sm">
                    Terbitkan
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Terbitkan obat?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Informasi obat akan tampil di halaman publik setelah diterbitkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      type="submit"
                      name="action"
                      value="publish"
                      form={`publish-drug-${drug.id}`}
                    >
                      Terbitkan
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      ) : null}

      {isAdmin && drug ? (
        <form id={`reject-drug-${drug.id}`} action={publishDrug}>
          <input type="hidden" name="id" value={drug.id} />
        </form>
      ) : null}

      <form action={saveAction} className="flex flex-col gap-4">
        {drug ? <input type="hidden" name="id" value={drug.id} /> : null}
        {isAdmin ? (
          <>
            <input type="hidden" name="status" value={drug?.status ?? "DRAFT"} />
            {drug?.reviewerId ? (
              <input type="hidden" name="reviewerId" value={drug.reviewerId} />
            ) : null}
          </>
        ) : null}

        <div className="flex flex-col gap-4">
          <ol
            className="grid gap-3 md:grid-cols-[repeat(var(--step-count),minmax(0,1fr))]"
            style={{ "--step-count": steps.length } as CSSProperties}
          >
            {steps.map((step, index) => (
              <li key={step.id} className="relative flex justify-center">
                {index < steps.length - 1 ? (
                  <span className="absolute top-4 left-1/2 hidden h-px w-full bg-border md:block" />
                ) : null}
                <button
                  type="button"
                  onClick={() => setActiveStep(index)}
                  aria-current={activeStep === index ? "step" : undefined}
                  className="group relative z-10 flex min-w-0 flex-col items-center gap-2 text-center"
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                      activeStep === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : index < activeStep
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "max-w-24 truncate text-sm font-medium",
                      activeStep === index ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <section className={cn(activeStep !== 0 && "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>Dasar</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <TextField
                  name="genericName"
                  label="Nama generik"
                  defaultValue={drug?.genericName}
                  required
                  readOnly={lockIdentity}
                />
                <TextAreaField
                  name="brandNames"
                  label="Merek, satu per baris"
                  defaultValue={lines(drug?.brandNames)}
                />
                <TextAreaField
                  name="aliases"
                  label="Alias, satu per baris"
                  defaultValue={lines(drug?.aliases)}
                />
                <TextField
                  name="drugClass"
                  label="Golongan obat"
                  defaultValue={drug?.drugClass}
                />
                <TextField
                  name="dosageForm"
                  label="Bentuk sediaan"
                  defaultValue={drug?.dosageForm}
                />
                {isAdmin ? (
                  <Field label="Jenis konten">
                    <select
                      name="isDemo"
                      defaultValue={drug?.isDemo === false ? "false" : "true"}
                      className="h-9 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="true">Demo</option>
                      <option value="false">Produksi</option>
                    </select>
                  </Field>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <section className={cn(activeStep !== 1 && "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>Publik</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <MarkdownEditorField
                  name="uses"
                  label="Kegunaan umum"
                  defaultValue={drug?.uses}
                  required
                />
                <MarkdownEditorField
                  name="generalUsage"
                  label="Cara pakai umum"
                  defaultValue={drug?.generalUsage}
                  required
                />
                <MarkdownEditorField
                  name="foodGuidance"
                  label="Hubungan makanan"
                  defaultValue={drug?.foodGuidance}
                />
                <MarkdownEditorField
                  name="commonSideEffects"
                  label="Efek samping umum"
                  defaultValue={drug?.commonSideEffects}
                />
                <MarkdownEditorField
                  name="warnings"
                  label="Peringatan"
                  defaultValue={drug?.warnings}
                />
                <MarkdownEditorField
                  name="seekHelpWhen"
                  label="Kapan mencari bantuan"
                  defaultValue={drug?.seekHelpWhen}
                />
              </CardContent>
            </Card>
          </section>

          <section className={cn(activeStep !== 2 && "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Obat untuk Apoteker</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <MarkdownEditorField
                  name="definition"
                  label="Pengertian"
                  defaultValue={drug?.definition}
                />
                <MarkdownEditorField
                  name="pharmacology"
                  label="Farmakologi"
                  defaultValue={drug?.pharmacology}
                />
                <MarkdownEditorField
                  name="formulation"
                  label="Formulasi"
                  defaultValue={drug?.formulation}
                />
                <MarkdownEditorField
                  name="indicationsAndDosage"
                  label="Indikasi dan dosis"
                  defaultValue={
                    drug?.indicationsAndDosage ??
                    drug?.pharmacistIndications
                  }
                />
                <MarkdownEditorField
                  name="sideEffectsAndInteractions"
                  label="Efek samping dan interaksi"
                  defaultValue={
                    drug?.sideEffectsAndInteractions ??
                    [
                      markdownList(drug?.seriousSideEffects),
                      markdownList(drug?.majorInteractions),
                    ]
                      .filter(Boolean)
                      .join("\n\n")
                  }
                />
                <MarkdownEditorField
                  name="pregnancyUse"
                  label="Penggunaan pada kehamilan"
                  defaultValue={drug?.pregnancyUse}
                />
                <MarkdownEditorField
                  name="contraindicationsAndWarnings"
                  label="Kontraindikasi dan peringatan"
                  defaultValue={
                    drug?.contraindicationsAndWarnings ??
                    markdownList(drug?.contraindications)
                  }
                />
                <MarkdownEditorField
                  name="clinicalMonitoring"
                  label="Pengawasan klinis"
                  defaultValue={
                    drug?.clinicalMonitoring ??
                    markdownList(drug?.monitoringParameters)
                  }
                />
                <MarkdownEditorField
                  name="counselingPointsMarkdown"
                  label="Poin konseling"
                  defaultValue={
                    drug?.counselingPointsMarkdown ??
                    markdownList(drug?.counselingPoints)
                  }
                />
                <MarkdownEditorField
                  name="referencesMarkdown"
                  label="Referensi"
                  defaultValue={
                    drug?.referencesMarkdown ?? markdownList(drug?.references)
                  }
                />
              </CardContent>
            </Card>
          </section>

          {isAdmin ? (
            <section className={cn(activeStep !== 3 && "hidden")}>
              <Card>
                <CardHeader>
                  <CardTitle>Review</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <Field label="Tanggal review">
                    <Input
                      type="date"
                      name="reviewedAt"
                      defaultValue={dateInput(drug?.reviewedAt)}
                      aria-required
                    />
                  </Field>
                </CardContent>
              </Card>
            </section>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={activeStep === 0}
              onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
            >
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={activeStep === steps.length - 1}
              onClick={() => setActiveStep((step) => Math.min(step + 1, steps.length - 1))}
            >
              Berikutnya
            </Button>
          </div>

          {isFinalStep ? (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={cancelHref}>Batal</Link>
              </Button>
              {isAdmin && drug ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      Tolak
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tolak Informasi Obat</DialogTitle>
                      <DialogDescription>
                        Catatan ini akan terlihat oleh apoteker pengirim.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`admin-note-${drug.id}`} className="text-sm font-medium">
                        Catatan penolakan
                      </label>
                      <Textarea
                        id={`admin-note-${drug.id}`}
                        name="adminNote"
                        form={`reject-drug-${drug.id}`}
                        defaultValue={drug.adminNote ?? ""}
                        required
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        name="action"
                        value="reject"
                        form={`reject-drug-${drug.id}`}
                        variant="outline"
                      >
                        Tolak
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
              <DrugSubmitButton
                label="Submit"
                loadingLabel={isAdmin ? "Menyimpan..." : "Mengirim..."}
                requiredNames={requiredNames}
              />
            </div>
          ) : null}
        </div>
      </form>
    </div>
  )
}
