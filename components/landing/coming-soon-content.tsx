import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

type ComingSoonContentProps = {
  title?: string
  description?: string
  primaryHref?: string
  primaryLabel?: string
}

export function ComingSoonContent({
  title = "Fitur segera hadir",
  description = "Tim Medisigna sedang menyiapkan layanan ini agar pengalaman konsultasi dan pengelolaan obat tetap rapi, aman, dan mudah dipakai.",
  primaryHref = "/",
  primaryLabel = "Kembali ke Beranda",
}: ComingSoonContentProps) {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
      <Button asChild className="w-fit">
        <Link href={primaryHref}>
          <ArrowLeftIcon data-icon="inline-start" />
          {primaryLabel}
        </Link>
      </Button>
    </section>
  )
}
