import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
    <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">FAQ</p>
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
    </section>
  )
}
