import type { Metadata } from "next"

import { ComingSoonContent } from "@/components/landing/coming-soon-content"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"

export const metadata: Metadata = {
  title: "Coming Soon | Medisigna",
  description: "Fitur Medisigna sedang disiapkan.",
}

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <ComingSoonContent />
      <SiteFooter />
    </main>
  )
}
