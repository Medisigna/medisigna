import Link from "next/link"
import Image from "next/image"
import { ArrowRightIcon } from "lucide-react"

import { HeroImageCarousel } from "@/components/landing/hero-image-carousel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    iconSrc: "/menu-icons/consult.png",
  },
  {
    label: "Obat A-Z",
    href: "/obat",
    iconSrc: "/menu-icons/medicines.png",
  },
  {
    label: "Artikel",
    href: "/artikel",
    iconSrc: "/menu-icons/article.png",
  },
  {
    label: "Video Edukasi",
    href: "/video",
    iconSrc: "/menu-icons/education.png",
  },
  {
    label: "Forum Diskusi",
    href: "/forum",
    iconSrc: "/menu-icons/Forum.png",
  },
  {
    label: "Beli Obat",
    href: "/coming-soon",
    comingSoon: true,
    iconSrc: "/menu-icons/Shop.png",
  },
  {
    label: "AI Apoteker",
    href: "/coming-soon",
    comingSoon: true,
    iconSrc: "/menu-icons/AI.png",
  },
  {
    label: "Lainnya",
    href: "/contact",
    iconSrc: "/menu-icons/etc.png",
  },
]

function ServiceMenu({
  className,
  itemClassName = "hover:bg-accent",
  iconWrapClassName,
  iconInnerClassName,
  iconClassName,
  labelClassName,
}: {
  className: string
  itemClassName?: string
  iconWrapClassName?: string
  iconInnerClassName?: string
  iconClassName?: string
  labelClassName?: string
}) {
  return (
    <nav aria-label="Menu layanan" className={className}>
      {serviceItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg px-1 text-center transition-colors sm:min-h-24 sm:gap-2 md:min-h-28 md:gap-2.5",
            itemClassName
          )}
        >
          <span
            className={cn(
              "relative flex size-10 items-center justify-center sm:size-12 md:size-14 lg:size-16",
              iconWrapClassName
            )}
          >
            <span
              className={cn(
                "flex size-full items-center justify-center",
                iconInnerClassName
              )}
            >
              <Image
                src={item.iconSrc}
                alt=""
                width={64}
                height={64}
                className={cn(
                  "size-8 object-contain sm:size-10 md:size-12 lg:size-14",
                  iconClassName
                )}
                aria-hidden="true"
              />
            </span>
            {item.comingSoon ? (
              <span className="absolute -top-1.5 -right-4 max-w-16 rounded-full bg-yellow-300 px-1 py-0.5 text-[7px] leading-none font-semibold whitespace-nowrap text-yellow-950 shadow-sm ring-1 ring-background/80 sm:-right-6 sm:px-1.5 sm:text-[9px] md:-top-2 md:-right-8 md:px-2 md:text-[10px]">
                Segera
              </span>
            ) : null}
          </span>
          <span
            className={cn(
              "max-w-full text-[9px] leading-3 font-semibold sm:text-xs md:text-sm md:leading-tight",
              labelClassName
            )}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}

export function HeroSection() {
  return (
    <section
      id="landing-hero"
      className="relative z-10 bg-secondary px-4 pt-24 pb-12 sm:px-6 sm:pt-28 lg:pt-32"
    >
      <div
        id="landing-hero-surface"
        className="mx-auto max-w-6xl rounded-[2rem] bg-[#0878ea] px-6 pt-10 pb-28 text-white sm:rounded-[2.5rem] sm:px-8 sm:pt-12 sm:pb-30 md:pb-28 lg:px-10 lg:pt-14 lg:pb-10"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(7.5rem,0.72fr)] items-center gap-4 sm:gap-6 lg:min-h-[62svh] lg:grid-cols-[1fr_0.72fr] lg:gap-12">
          <div className="flex max-w-2xl flex-col gap-4 sm:gap-5 lg:gap-7">
            <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5">
              <h1 className="max-w-2xl text-xl font-semibold tracking-tight sm:text-3xl md:text-5xl lg:text-6xl">
                Konseling obat lebih jelas, aman, dan tertib.
              </h1>
              <p className="hidden max-w-xl text-xs leading-5 text-white/82 sm:text-sm sm:leading-6 md:text-base lg:text-lg lg:leading-7">
                Konsultasi penggunaan obat dengan apoteker terverifikasi, dari
                aturan pakai sampai tindak lanjut terapi.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                asChild
                size="lg"
                className="h-9 px-3 text-xs bg-white text-[#0878ea] hover:bg-white/90 sm:h-10 sm:text-sm lg:h-11 lg:px-8 lg:text-base"
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
                className="hidden border-white/40 bg-white/10 text-white hover:bg-white hover:text-[#0878ea] lg:inline-flex lg:h-11 lg:px-8 lg:text-base"
              >
                <Link href="/obat">Lihat Obat A-Z</Link>
              </Button>
            </div>
            <ServiceMenu
              className="hidden max-w-xl grid-cols-5 gap-2 text-white lg:grid"
              itemClassName="border-0 bg-transparent text-white no-underline hover:bg-transparent hover:text-white hover:no-underline lg:min-h-[6.55rem] lg:gap-2"
              iconWrapClassName="rounded-full bg-white/15 lg:size-20"
              iconInnerClassName="rounded-full bg-white shadow-sm lg:size-[3.9rem]"
              iconClassName="lg:size-[2.75rem]"
              labelClassName="text-white no-underline lg:text-[0.92rem]"
            />
          </div>

          <HeroImageCarousel items={carouselItems} />
        </div>
      </div>

      <ServiceMenu
        className="relative z-20 mx-auto -mt-16 -mb-32 grid max-w-5xl grid-cols-4 gap-2 rounded-xl bg-secondary p-2 text-card-foreground sm:-mt-[4.5rem] sm:-mb-36 sm:gap-3 sm:p-3 md:grid-cols-4 lg:hidden"
        itemClassName="h-20 min-h-0 rounded-[1.25rem] bg-secondary gap-1 shadow-none ring-0 hover:bg-secondary/80 sm:h-20 sm:min-h-0 md:h-20 md:min-h-0 md:gap-1"
        iconWrapClassName="size-10 sm:size-10 md:size-10"
        iconInnerClassName="size-full"
        iconClassName="size-7 sm:size-7 md:size-7"
        labelClassName="px-1 text-[11px] leading-tight text-secondary-foreground sm:text-[11px] md:text-[11px]"
      />
    </section>
  )
}
