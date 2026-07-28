import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"

const footerLinks = [
  {
    title: "Produk",
    links: [
      ["Informasi Obat", "/obat"],
      ["Konsultasi Obat", "/pharmacists"],
      ["Video Edukasi", "/video"],
      ["FAQ", "/faq"],
      ["Kontak", "/contact"],
    ],
  },
  {
    title: "Perusahaan",
    links: [
      ["Tentang", "/about"],
      ["Masuk", "/login"],
      ["Daftar Pasien", "/register"],
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_auto]">
          <div className="flex max-w-sm flex-col gap-3">
            <Link href="/" className="flex w-fit items-center gap-2 font-semibold">
              <BrandLogo className="size-9" />
              <span>Medisigna</span>
            </Link>
            <p className="text-sm leading-6 text-primary-foreground/75">
              Konsultasi obat dengan apoteker terverifikasi, dibuat lebih mudah
              untuk pasien dan keluarga.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {footerLinks.map((group) => (
              <div key={group.title} className="flex flex-col gap-3">
                <p className="text-sm font-semibold">{group.title}</p>
                <nav className="flex flex-col gap-2 text-sm text-primary-foreground/75">
                  {group.links.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className="w-fit underline-offset-4 transition-colors hover:text-primary-foreground hover:underline"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="max-w-44 text-sm text-primary-foreground/75 md:text-right">
              Apoteker dapat bergabung untuk melayani konsultasi pasien.
            </p>
            <Link
              href="/register/pharmacist"
              className="text-sm font-semibold underline-offset-4 transition-colors hover:text-primary-foreground/80 hover:underline"
            >
              Daftar Apoteker
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-primary-foreground/20 pt-5 text-xs text-primary-foreground/65 sm:flex-row sm:items-center sm:justify-between">
          <p>2026 Medisigna. Semua hak dilindungi.</p>
          <p>Informasi di Medisigna tidak menggantikan diagnosis dokter.</p>
        </div>
      </div>
    </footer>
  )
}
