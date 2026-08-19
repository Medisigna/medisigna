import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="relative isolate overflow-hidden rounded-xl border border-primary/10 bg-card p-6 shadow-[0_24px_56px_-46px_rgba(8,120,234,0.42),0_0_48px_-38px_rgba(77,241,255,0.58)] md:p-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,120,234,0.05),transparent_38%,rgba(52,211,153,0.06))]"
        />
        <div
          aria-hidden="true"
          className="animate-landing-neon-glow absolute -left-24 -top-16 h-52 w-96 rounded-[62%_38%_48%_52%/48%_56%_44%_52%] bg-[radial-gradient(ellipse_at_center,rgba(77,241,255,0.16)_0%,rgba(8,120,234,0.08)_48%,transparent_76%)] blur-3xl"
        />
        <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center md:p-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Mulai konsultasi pertama Anda.
            </h2>
            <p className="text-sm text-muted-foreground">
              Buat akun pasien dan mulai konsultasi dengan apoteker.
            </p>
          </div>
          <Button asChild>
            <Link href="/pharmacists">
              Mulai Konsultasi
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
