import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  CircleAlertIcon,
  StethoscopeIcon,
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
import type { DrugDetailData } from "@/lib/drugs"

function MarkdownSection({
  title,
  source,
}: {
  title: string
  source: string | null
}) {
  if (!source) return null

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="leading-7 text-muted-foreground">
        <MarkdownPreview source={source} />
      </div>
    </section>
  )
}

export function DrugDetail({
  drug,
  backHref,
  pharmacistsHref,
}: {
  drug: DrugDetailData
  backHref: string
  pharmacistsHref: string
}) {
  const reviewDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeZone: "Asia/Makassar",
  }).format(drug.reviewedAt)
  const reviewerTitle = drug.reviewer.pharmacistProfile?.title

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link href={backHref}>
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali ke Informasi Obat
        </Link>
      </Button>

      <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <p className="text-sm font-medium text-muted-foreground">
                Informasi Obat {drug.isDemo ? "• Konten demo" : ""}
              </p>
              <CardTitle className="text-3xl tracking-tight md:text-4xl">
                {drug.genericName}
              </CardTitle>
              <CardDescription>
                {drug.brandNames.length
                  ? `Contoh merek: ${drug.brandNames.join(", ")}`
                  : "Nama merek dapat berbeda pada setiap produk."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-8 pt-2">
              <MarkdownSection title="Kegunaan umum" source={drug.uses} />
              <MarkdownSection title="Cara pakai umum" source={drug.generalUsage} />

              {drug.foodGuidance ? (
                <MarkdownSection
                  title="Hubungan dengan makanan"
                  source={drug.foodGuidance}
                />
              ) : null}

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

              {drug.aliases.length ? (
                <section className="flex flex-col gap-2 border-t pt-6">
                  <h2 className="text-sm font-semibold">Nama lain</h2>
                  <p className="text-sm text-muted-foreground">
                    {drug.aliases.join(", ")}
                  </p>
                </section>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-destructive/25 bg-destructive/5 shadow-none">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive">
                <CircleAlertIcon className="size-5" />
                <CardTitle>Informasi demo, bukan rujukan klinis</CardTitle>
              </div>
              <CardDescription className="leading-6">
                Konten ini dibuat untuk pengujian fitur dan harus diganti serta
                divalidasi sebelum penggunaan produksi. Jangan mengubah,
                menghentikan, atau memulai obat berdasarkan halaman ini.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Peninjauan konten</CardTitle>
              <CardDescription>
                Identitas reviewer demo yang tercatat pada sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <UserRoundCheckIcon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {drug.reviewer.name}
                    {reviewerTitle ? `, ${reviewerTitle}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    Apoteker{" "}
                    {drug.reviewer.pharmacistProfile?.verificationStatus ===
                    "VERIFIED"
                      ? "terverifikasi"
                      : "belum terverifikasi"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="font-medium">Tanggal review</p>
                  <p className="text-muted-foreground">{reviewDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <StethoscopeIcon className="size-7" />
              <CardTitle>Masih punya pertanyaan?</CardTitle>
              <CardDescription className="text-primary-foreground/75">
                Konsultasikan kebutuhan dan kondisi Anda kepada apoteker
                terverifikasi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href={pharmacistsHref}>
                  Tanya Apoteker
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  )
}
