import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

const carouselItems = [
  {
    title: "Konsultasi apoteker",
    image: "/landing-carousel/apoteker1.png",
  },
  {
    title: "Review obat",
    image: "/landing-carousel/apoteker2.png",
  },
  {
    title: "Tindak lanjut terapi",
    image: "/landing-carousel/apoteker3.png",
  },
]

export function HeroSection() {
  return (
    <section className="mx-auto grid min-h-[78svh] max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1fr_0.68fr] lg:py-20">
      <div className="flex max-w-2xl flex-col gap-7">
        <div className="flex w-fit items-center gap-2 rounded-full border bg-muted/70 px-3 py-1 text-sm font-medium text-muted-foreground shadow-xs">
          <ShieldCheck className="size-4" />
          Apoteker terverifikasi
        </div>
        <div className="flex flex-col gap-5">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Konseling obat lebih jelas, aman, dan tertib.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Konsultasi penggunaan obat dengan apoteker terverifikasi, dari
            aturan pakai sampai tindak lanjut terapi.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/register">
              Mulai Konsultasi
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Daftar Sekarang</Link>
          </Button>
        </div>
      </div>

      <div
        className="relative isolate mx-auto w-full max-w-sm overflow-hidden rounded-2xl lg:max-w-none"
        aria-label="Sorotan layanan Medisigna"
      >
        <div className="flex [animation:hero-carousel_18s_ease-in-out_infinite] motion-reduce:animate-none">
          {carouselItems.map((item) => (
            <div key={item.title} className="min-w-full">
              <Image
                src={item.image}
                alt={item.title}
                width={900}
                height={1100}
                sizes="(min-width: 1024px) 400px, 100vw"
                priority={item === carouselItems[0]}
                className="aspect-[5/6] max-h-[28rem] w-full rounded-2xl object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {carouselItems.map((item, index) => (
            <span
              key={item.title}
              aria-hidden="true"
              className="size-1.5 rounded-full bg-primary/30 [animation:hero-carousel-dot_18s_ease-in-out_infinite]"
              style={{ animationDelay: `${index * 6}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
