import Link from "next/link"
import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 text-sm">
        <Link href="/" className="font-semibold">
          Medisigna
        </Link>
        <nav className="flex items-center gap-4 text-muted-foreground">
          <Link href="/about">Tentang</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Kontak</Link>
        </nav>
      </header>
      <section className="mx-auto flex min-h-[78svh] max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ShieldCheck data-icon="inline-start" />
            Medisigna
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Konseling obat yang lebih tertib.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Platform konsultasi masyarakat dan apoteker dengan verifikasi profesi sejak awal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/register">Daftar Akun</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
      <footer className="border-t px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Medisigna</span>
          <Button asChild variant="link" className="w-fit px-0">
            <Link href="/register/pharmacist">Daftar sebagai Apoteker</Link>
          </Button>
        </div>
      </footer>
    </main>
  )
}
