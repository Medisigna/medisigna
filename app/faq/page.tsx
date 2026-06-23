import Link from "next/link"

const faqs = [
  {
    question: "Apakah apoteker diverifikasi?",
    answer: "Ya. Akun apoteker perlu melewati proses verifikasi sebelum tampil untuk pasien.",
  },
  {
    question: "Apakah pasien perlu membuat akun?",
    answer: "Ya. Akun pasien dipakai untuk menyimpan profil dan mengakses dashboard konsultasi.",
  },
  {
    question: "Kapan fitur chat tersedia?",
    answer: "Fitur chat disiapkan di dashboard dan akan dibuka setelah alur konsultasi siap.",
  },
]

export default function FaqPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-6 px-6 py-16">
      <Link href="/" className="text-sm font-medium text-muted-foreground">
        Medisigna
      </Link>
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">FAQ</h1>
        <div className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-md border bg-card p-4">
              <h2 className="font-medium">{faq.question}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
