import Link from "next/link"
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  CalendarIcon,
  FlaskConicalIcon,
  PillIcon,
  UserRoundCheckIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MarkdownPreview } from "@/components/markdown-preview"
import type { PharmacistDrugDetailData } from "@/lib/drugs"

function formatDate(date: Date | null) {
  if (!date) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  )
}

function listMarkdown(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n")
}

function MarkdownSection({
  title,
  source,
}: {
  title: string
  source: string | null
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      {source ? (
        <div className="leading-7 text-muted-foreground">
          <MarkdownPreview source={source} />
        </div>
      ) : (
        <p className="text-muted-foreground">Belum ada data.</p>
      )}
    </section>
  )
}

export function PharmacistDrugDetail({
  drug,
}: {
  drug: PharmacistDrugDetailData
}) {
  const reviewerTitle = drug.reviewer.pharmacistProfile?.title

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/pharmacist/dashboard/obat">
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali ke Informasi Obat
        </Link>
      </Button>

      <section className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                {drug.drugClass ? <Badge>{drug.drugClass}</Badge> : null}
                {drug.dosageForm ? <Badge>{drug.dosageForm}</Badge> : null}
                <Badge>{drug.isDemo ? "Konten demo" : "Konten produksi"}</Badge>
              </div>
              <CardTitle className="text-3xl tracking-tight md:text-4xl">
                {drug.genericName}
              </CardTitle>
              <CardDescription>
                {drug.brandNames.length
                  ? `Contoh merek: ${drug.brandNames.join(", ")}`
                  : "Nama merek dapat berbeda pada setiap produk."}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan publik</CardTitle>
              <CardDescription>
                Informasi yang juga terlihat oleh pasien.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <MarkdownSection title="Kegunaan umum" source={drug.uses} />
              <MarkdownSection title="Cara pakai umum" source={drug.generalUsage} />
              <MarkdownSection
                title="Efek samping umum"
                source={drug.commonSideEffects}
              />
              <MarkdownSection
                title="Peringatan"
                source={drug.warnings}
              />
              <MarkdownSection
                title="Kapan mencari bantuan"
                source={drug.seekHelpWhen}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi profesional</CardTitle>
              <CardDescription>
                Konten read-only untuk apoteker.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <MarkdownSection title="Pengertian" source={drug.definition} />
              <MarkdownSection title="Farmakologi" source={drug.pharmacology} />
              <MarkdownSection title="Formulasi" source={drug.formulation} />
              <MarkdownSection
                title="Indikasi dan dosis"
                source={drug.indicationsAndDosage ?? drug.pharmacistIndications}
              />
              <MarkdownSection
                title="Efek samping dan interaksi"
                source={
                  drug.sideEffectsAndInteractions ||
                  [
                    listMarkdown(drug.seriousSideEffects),
                    listMarkdown(drug.majorInteractions),
                  ]
                    .filter(Boolean)
                    .join("\n\n")
                }
              />
              <MarkdownSection
                title="Penggunaan pada kehamilan"
                source={drug.pregnancyUse}
              />
              <MarkdownSection
                title="Kontraindikasi dan peringatan"
                source={
                  drug.contraindicationsAndWarnings ||
                  listMarkdown(drug.contraindications)
                }
              />
              <MarkdownSection
                title="Pengawasan klinis"
                source={
                  drug.clinicalMonitoring ||
                  listMarkdown(drug.monitoringParameters)
                }
              />
              <MarkdownSection
                title="Poin konseling"
                source={
                  drug.counselingPointsMarkdown ||
                  listMarkdown(drug.counselingPoints)
                }
              />
              <MarkdownSection
                title="Referensi"
                source={drug.referencesMarkdown || listMarkdown(drug.references)}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadata review</CardTitle>
              <CardDescription>Status dan peninjau konten.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <UserRoundCheckIcon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {drug.reviewer.name}
                    {reviewerTitle ? `, ${reviewerTitle}` : ""}
                  </p>
                  <p className="text-muted-foreground">Apoteker terverifikasi</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium">Tanggal review</p>
                  <p className="text-muted-foreground">
                    {formatDate(drug.reviewedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarClockIcon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium">Review ulang</p>
                  <p className="text-muted-foreground">
                    {formatDate(drug.reviewDueAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkas klinis</CardTitle>
              <CardDescription>Data cepat untuk identifikasi.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <PillIcon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium">Golongan</p>
                  <p className="text-muted-foreground">
                    {drug.drugClass ?? "Belum ada data"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FlaskConicalIcon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium">Bentuk sediaan</p>
                  <p className="text-muted-foreground">
                    {drug.dosageForm ?? "Belum ada data"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}
