import Link from "next/link"
import { HeartPulseIcon } from "lucide-react"

export function AuthBrandLink() {
  return (
    <Link
      href="/"
      aria-label="Kembali ke beranda Medisigna"
      className="mx-auto flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <HeartPulseIcon className="size-6" aria-hidden="true" />
    </Link>
  )
}
