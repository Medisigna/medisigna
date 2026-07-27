import Link from "next/link"
import Image from "next/image"
import {
  ArrowRightIcon,
  BotIcon,
  MessageCircleIcon,
  PillIcon,
  ShoppingBagIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const carouselItems = [
  {
    title: "Review obat",
    image: "/landing-carousel/apoteker2.png",
  },
  {
    title: "Tindak lanjut terapi",
    image: "/landing-carousel/apoteker3.png",
  },
]

const serviceItems = [
  {
    label: "Konsultasi",
    href: "/pharmacists",
    icon: MessageCircleIcon,
    tone: "bg-sky-500 text-white",
  },
  {
    label: "Obat A-Z",
    href: "/obat",
    icon: PillIcon,
    tone: "bg-emerald-500 text-white",
  },
  {
    label: "Beli Obat",
    href: "/coming-soon",
    comingSoon: true,
    icon: ShoppingBagIcon,
    tone: "bg-orange-500 text-white",
  },
  {
    label: "AI Apoteker",
    href: "/coming-soon",
    comingSoon: true,
    icon: BotIcon,
    tone: "bg-violet-500 text-white",
  },
]

export function HeroSection() {
  return (
    <section
      id="landing-hero"
      className="relative z-10 bg-[#0878ea] px-6 pt-24 pb-12 text-white sm:pt-28 lg:pt-32"
    >
      <div className="mx-auto grid min-h-[70svh] max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.72fr]">
        <div className="flex max-w-2xl flex-col gap-7">
          <div className="flex flex-col gap-5">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
              Konseling obat lebih jelas, aman, dan tertib.
            </h1>
            <p className="max-w-xl text-base leading-7 text-white/82 md:text-lg">
              Konsultasi penggunaan obat dengan apoteker terverifikasi, dari
              aturan pakai sampai tindak lanjut terapi.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#0878ea] hover:bg-white/90"
            >
              <Link href="/pharmacists">
                Mulai Konsultasi
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-[#0878ea]"
            >
              <Link href="/obat">Lihat Obat A-Z</Link>
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
                className="size-1.5 [animation:hero-carousel-dot_18s_ease-in-out_infinite] rounded-full bg-white/45 text-white"
                style={{ animationDelay: `${index * 6}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      <nav
        aria-label="Menu layanan"
        className="relative z-20 mx-auto mt-10 -mb-24 grid max-w-5xl grid-cols-4 gap-1 rounded-xl border border-border bg-card p-2 text-card-foreground sm:-mb-26 sm:gap-2 sm:p-3 md:-mb-28 lg:-mb-30 lg:gap-0 lg:px-8 lg:py-6"
      >
        {serviceItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-1 transition-colors hover:bg-accent sm:min-h-24 sm:gap-2 md:min-h-30 md:gap-3"
            >
              <span className="relative">
                <span
                  className={`flex size-8 items-center justify-center rounded-full shadow-xs sm:size-10 md:size-12 lg:size-16 ${item.tone}`}
                >
                  <Icon
                    className="size-3.5 sm:size-4 md:size-5 lg:size-7"
                    aria-hidden="true"
                  />
                </span>
                {item.comingSoon ? (
                  <span className="absolute -top-1.5 -right-3 rounded-full bg-yellow-300 px-1 py-0.5 text-[7px] leading-none font-semibold whitespace-nowrap text-yellow-950 shadow-sm ring-1 ring-background/80 sm:-right-5 sm:px-1.5 sm:text-[9px] md:-top-2 md:-right-8 md:px-2 md:text-[10px] lg:-right-7">
                    Coming soon
                  </span>
                ) : null}
              </span>
              <span className="text-center text-[9px] leading-3 font-semibold sm:text-xs md:text-sm md:leading-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </section>
  )
}
