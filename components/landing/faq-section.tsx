import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LandingHighlightTitle } from "@/components/landing/landing-highlight-title"

const faqs = [
  {
    question: "Apakah ini pengganti dokter?",
    answer:
      "Tidak. Medisigna membantu konseling obat dan arahan awal bersama apoteker.",
  },
  {
    question: "Siapa yang menjawab konsultasi?",
    answer: "Konsultasi dijawab oleh apoteker yang melewati verifikasi profesi.",
  },
  {
    question: "Apakah data konsultasi tersimpan?",
    answer:
      "Ya. Riwayat konsultasi tersimpan agar pasien dan apoteker dapat meninjau tindak lanjut.",
  },
]

export function FaqSection() {
  return (
    <section className="relative overflow-hidden bg-secondary px-6 py-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      <div
        aria-hidden="true"
        className="animate-landing-neon-glow absolute -left-24 top-0 h-56 w-[30rem] rounded-[68%_32%_48%_52%/40%_60%_40%_60%] bg-[radial-gradient(ellipse_at_center,rgba(8,120,234,0.11)_0%,rgba(77,241,255,0.08)_46%,transparent_76%)] blur-3xl [animation-delay:0.35s]"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <LandingHighlightTitle as="p" className="text-sm md:text-sm">
            FAQ
          </LandingHighlightTitle>
          <h2 className="text-3xl font-semibold tracking-tight">
            Pertanyaan singkat.
          </h2>
        </div>
        <Accordion
          type="single"
          collapsible
          defaultValue={faqs[0]?.question}
          className=""
        >
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question}>
              <AccordionTrigger className="text-base font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
