import Link from "next/link"

import { publishDrug } from "@/app/actions/admin/publish-drug"
import { saveDrug } from "@/app/actions/admin/save-drug"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { AdminDrugDetailData } from "@/lib/drugs"

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
  children: React.ReactNode
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
      <Input name={name} defaultValue={defaultValue ?? ""} required={required} />
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
        required={required}
        rows={rows}
      />
    </Field>
  )
}

export function DrugForm({
  drug,
  reviewers,
}: {
  drug?: AdminDrugDetailData | null
  reviewers: Reviewer[]
}) {
  return (
    <div className="flex flex-col gap-4">
      {drug ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/obat/${drug.id}?preview=public`}>
              Preview admin
            </Link>
          </Button>
          {drug.status === "PUBLISHED" ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/obat/${drug.slug}`} target="_blank">
                Preview publik
              </Link>
            </Button>
          ) : null}
          <form action={publishDrug}>
            <input type="hidden" name="id" value={drug.id} />
            <Button
              type="submit"
              name="action"
              value={drug.status === "PUBLISHED" ? "draft" : "publish"}
              variant={drug.status === "PUBLISHED" ? "outline" : "default"}
              size="sm"
            >
              {drug.status === "PUBLISHED" ? "Jadikan Draft" : "Terbitkan"}
            </Button>
          </form>
        </div>
      ) : null}

      <form action={saveDrug} className="flex flex-col gap-4">
        {drug ? <input type="hidden" name="id" value={drug.id} /> : null}
        <Tabs defaultValue="basic">
          <TabsList className="flex w-full flex-wrap justify-start">
            <TabsTrigger value="basic">Dasar</TabsTrigger>
            <TabsTrigger value="public">Publik</TabsTrigger>
            <TabsTrigger value="pharmacist">Apoteker</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
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
                <TextField
                  name="slug"
                  label="Slug"
                  defaultValue={drug?.slug}
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
                <Field label="Status">
                  <select
                    name="status"
                    defaultValue={drug?.status ?? "DRAFT"}
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </Field>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="public">
            <Card>
              <CardHeader>
                <CardTitle>Publik</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <TextAreaField
                  name="uses"
                  label="Kegunaan umum"
                  defaultValue={drug?.uses}
                  required
                />
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
          </TabsContent>

          <TabsContent value="pharmacist">
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
          </TabsContent>

          <TabsContent value="review">
            <Card>
              <CardHeader>
                <CardTitle>Review</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Reviewer">
                  <select
                    name="reviewerId"
                    defaultValue={drug?.reviewerId ?? ""}
                    required
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Pilih reviewer</option>
                    {reviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name}
                        {reviewer.pharmacistProfile?.title
                          ? `, ${reviewer.pharmacistProfile.title}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tanggal review">
                  <Input
                    type="date"
                    name="reviewedAt"
                    defaultValue={dateInput(drug?.reviewedAt)}
                    required
                  />
                </Field>
                <Field label="Review ulang">
                  <Input
                    type="date"
                    name="reviewDueAt"
                    defaultValue={dateInput(drug?.reviewDueAt)}
                  />
                </Field>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/obat">Batal</Link>
          </Button>
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </div>
  )
}
