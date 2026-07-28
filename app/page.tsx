import { ArticlesSection } from "@/components/landing/articles-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { FaqSection } from "@/components/landing/faq-section"
import { HeroSection } from "@/components/landing/hero-section"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { VideosSection } from "@/components/landing/videos-section"

export default function Page() {
  return (
    <main className="min-h-svh bg-background">
      <SiteHeader />
      <HeroSection />
      <VideosSection />
      <ArticlesSection />
      <FaqSection />
      <FinalCtaSection />
      <SiteFooter />
    </main>
  )
}
