import Link from "next/link"

import { BrandLogo } from "@/components/brand-logo"

export function AuthBrandLink() {
  return (
    <Link
      href="/"
      aria-label="Kembali ke beranda Medisigna"
      className="mx-auto flex size-14 items-center justify-center rounded-lg bg-white shadow-xs transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <BrandLogo className="size-12 shadow-none" />
    </Link>
  )
}
