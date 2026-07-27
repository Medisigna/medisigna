import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const articles = [
  {
    title: "Cara Aman Menggunakan Obat Bebas di Rumah",
    category: "Edukasi Obat",
    excerpt:
      "Kenali aturan pakai, dosis, dan tanda bahaya sebelum memilih obat tanpa resep.",
    date: {
      day: "15",
      month: "Mei",
    },
    image: "/landing-carousel/apoteker1.png",
    href: "#",
  },
  {
    title: "Kapan Harus Bertanya ke Apoteker?",
    category: "Konsultasi",
    excerpt:
      "Beberapa keluhan terlihat ringan, tetapi tetap perlu arahan agar terapi lebih aman.",
    date: {
      day: "18",
      month: "Mei",
    },
    image: "/landing-carousel/apoteker2.png",
    href: "#",
  },
]

export function ArticlesSection() {
  return (
    <section className="bg-background px-6 pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:gap-10">
        <h2 className="max-w-3xl text-center text-2xl font-semibold tracking-tight text-foreground md:text-5xl">
          Tetap Update Dengan{" "}
          <span className="text-primary">Artikel Terbaru</span>
        </h2>

        <div className="grid w-full gap-5 lg:grid-cols-2">
          {articles.map((article) => (
            <article key={article.title}>
              <Card className="grid gap-0 py-0 transition-shadow hover:shadow-md sm:grid-cols-[11rem_minmax(0,1fr)]">
                <div className="relative aspect-[16/11] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-56">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(min-width: 1024px) 176px, (min-width: 640px) 176px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex min-w-14 flex-col items-center rounded-lg bg-background/90 px-3 py-2 text-center shadow-sm backdrop-blur">
                    <span className="text-xl leading-none font-semibold text-foreground">
                      {article.date.day}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {article.date.month}
                    </span>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col py-4 md:py-5">
                  <CardHeader>
                    <span className="w-fit rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {article.category}
                    </span>
                    <CardTitle className="line-clamp-2 text-lg font-semibold tracking-tight md:text-xl">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 md:pt-3">
                    <p className="line-clamp-2 text-sm leading-5 text-muted-foreground md:leading-6">
                      {article.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto pt-3 md:pt-4">
                    <Link
                      href={article.href}
                      className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Baca selengkapnya
                    </Link>
                  </CardFooter>
                </div>
              </Card>
            </article>
          ))}
        </div>

        <Button
          asChild
          className="rounded-full bg-foreground text-background hover:bg-foreground/90"
        >
          <Link href="#">
            Lihat Semua Artikel
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
