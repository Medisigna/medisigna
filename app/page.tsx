import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { FaqSection } from "@/components/landing/faq-section"
import { HeroSection } from "@/components/landing/hero-section"
import { ServicesSection } from "@/components/landing/services-section"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { TrustSection } from "@/components/landing/trust-section"

export default function Page() {
  return (
    <main className="min-h-svh bg-background">
      <SiteHeader />

      <HeroSection />
      <ServicesSection />
      <TrustSection />
      <FaqSection />
      <FinalCtaSection />
      <SiteFooter />
    </main>
  )
}
