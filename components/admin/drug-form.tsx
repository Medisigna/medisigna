"use client"

import Link from "next/link"
import { type CSSProperties, type ReactNode, useState } from "react"

import { publishDrug } from "@/app/actions/admin/publish-drug"
import { saveDrug } from "@/app/actions/admin/save-drug"
import { DrugSubmitButton } from "@/components/admin/drug-submit-button"
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
}: {
  name: string
  label: string
  defaultValue?: string | null
  required?: boolean
}) {
  return (
    <Field label={label}>
      <Input name={name} defaultValue={defaultValue ?? ""} aria-required={required} />
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
}: {
  drug?: AdminDrugDetailData | null
  reviewers?: Reviewer[]
  saveAction?: SaveDrugAction
  mode?: "admin" | "pharmacist"
  cancelHref?: string
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
            <form action={publishDrug}>
              <input type="hidden" name="id" value={drug.id} />
              <Button type="submit" name="action" value="publish" size="sm">
                Terbitkan
              </Button>
            </form>
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
                <TextAreaField name="uses" label="Kegunaan umum" defaultValue={drug?.uses} required />
                <TextAreaField
                  name="generalUsage"
                  label="Cara pakai umum"
                  defaultValue={drug?.generalUsage}
                  required
                />
                <TextAreaField
                  name="foodGuidance"
                  label="Hubungan makanan"
                  defaultValue={drug?.foodGuidance}
                />
                <TextAreaField
                  name="commonSideEffects"
                  label="Efek samping umum, satu per baris"
                  defaultValue={lines(drug?.commonSideEffects)}
                />
                <TextAreaField
                  name="warnings"
                  label="Peringatan, satu per baris"
                  defaultValue={lines(drug?.warnings)}
                />
                <TextAreaField
                  name="seekHelpWhen"
                  label="Kapan mencari bantuan, satu per baris"
                  defaultValue={lines(drug?.seekHelpWhen)}
                />
              </CardContent>
            </Card>
          </section>

          <section className={cn(activeStep !== 2 && "hidden")}>
            <Card>
              <CardHeader>
                <CardTitle>Apoteker</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <TextAreaField
                  name="pharmacistIndications"
                  label="Indikasi apoteker"
                  defaultValue={drug?.pharmacistIndications}
                />
                <TextAreaField
                  name="counselingPoints"
                  label="Counseling points, satu per baris"
                  defaultValue={lines(drug?.counselingPoints)}
                />
                <TextAreaField
                  name="screeningQuestions"
                  label="Pertanyaan skrining, satu per baris"
                  defaultValue={lines(drug?.screeningQuestions)}
                />
                <TextAreaField
                  name="contraindications"
                  label="Kontraindikasi/perhatian, satu per baris"
                  defaultValue={lines(drug?.contraindications)}
                />
                <TextAreaField
                  name="majorInteractions"
                  label="Interaksi penting, satu per baris"
                  defaultValue={lines(drug?.majorInteractions)}
                />
                <TextAreaField
                  name="seriousSideEffects"
                  label="Efek samping serius, satu per baris"
                  defaultValue={lines(drug?.seriousSideEffects)}
                />
                <TextAreaField
                  name="monitoringParameters"
                  label="Monitoring, satu per baris"
                  defaultValue={lines(drug?.monitoringParameters)}
                />
                <TextAreaField
                  name="referralCriteria"
                  label="Kriteria rujukan, satu per baris"
                  defaultValue={lines(drug?.referralCriteria)}
                />
                <TextAreaField
                  name="internalNotes"
                  label="Catatan internal"
                  defaultValue={drug?.internalNotes}
                />
                <TextAreaField
                  name="references"
                  label="Referensi, satu per baris"
                  defaultValue={lines(drug?.references)}
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
