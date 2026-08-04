import Link from "next/link"

import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <main className="flex min-h-svh flex-col bg-secondary">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
        <section className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Tentang Medisigna
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Medisigna membantu masyarakat berkonsultasi dengan apoteker
            terverifikasi secara lebih tertib dan mudah.
          </p>
        </section>
        <Button asChild className="w-fit">
          <Link href="/register">Daftar Akun</Link>
        </Button>
      </div>
      <SiteFooter />
    </main>
  )
}
