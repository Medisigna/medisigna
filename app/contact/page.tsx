import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <Link href="/" className="text-sm font-medium text-muted-foreground">
        Medisigna
      </Link>
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Kontak</h1>
        <p className="text-base leading-7 text-muted-foreground">
          Hubungi tim Medisigna untuk bantuan akun, kerja sama apoteker, atau pertanyaan layanan.
        </p>
      </section>
      <Button asChild className="w-fit">
        <Link href="mailto:halo@medisigna.local">halo@medisigna.local</Link>
      </Button>
    </main>
  )
}
