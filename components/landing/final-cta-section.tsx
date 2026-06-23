import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col items-start justify-between gap-5 rounded-xl border bg-card p-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Mulai konsultasi obat pertama Anda.
          </h2>
          <p className="text-sm text-muted-foreground">
            Buat akun pasien dan mulai konsultasi dengan apoteker.
          </p>
        </div>
        <Button asChild>
          <Link href="/register">
            Mulai Konsultasi
            <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
