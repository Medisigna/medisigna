"use client"

import * as React from "react"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const promoItems = [
  {
    title: "Konsultasi obat",
    description: "Tanyakan aturan pakai dan efek samping obat langsung ke apoteker.",
    imageSrc: "https://unsplash.com/photos/sLddRFha0_Q/download?force=true",
    imageAlt: "Dokter berkonsultasi dengan pasien lewat video call.",
    imagePosition: "object-[62%_center]",
  },
  {
    title: "Cek aturan pakai",
    description: "Pastikan dosis, waktu minum, dan cara pakai obat lebih jelas.",
    imageSrc: "https://images.unsplash.com/photo-1610046869459-b4d6402043da?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&w=1200",
    imageAlt: "Kapsul dan tablet obat dengan warna merah, putih, dan biru.",
    imagePosition: "object-center",
  },
  {
    title: "Apoteker terverifikasi",
    description: "Pilih apoteker yang sudah melewati proses verifikasi Medisigna.",
    imageSrc: "https://unsplash.com/photos/mLaIFEtUZFs/download?force=true",
    imageAlt: "Rak apotek berisi botol obat dan label resep.",
    imagePosition: "object-center",
  },
]

export function DashboardPromoCarousel() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) return

    const updateSelectedIndex = () => setSelectedIndex(api.selectedScrollSnap())

    updateSelectedIndex()
    api.on("select", updateSelectedIndex)

    return () => {
      api.off("select", updateSelectedIndex)
    }
  }, [api])

  React.useEffect(() => {
    if (!api) return

    const interval = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext()
      else api.scrollTo(0)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [api])

  return (
    <section aria-label="Promo Medisigna">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        className="overflow-hidden rounded-2xl"
      >
        <CarouselContent>
          {promoItems.map((item, index) => (
            <CarouselItem key={item.title}>
              <div className="relative flex min-h-40 items-end overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-[0_18px_40px_-28px_rgba(14,47,89,0.6)] ring-1 ring-primary/20 md:min-h-52">
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={cn(
                    "absolute inset-0 size-full object-cover",
                    item.imagePosition
                  )}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/36 to-black/10" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                <div className="relative flex max-w-xl flex-col gap-3 p-5 md:p-7">
                  <p className="w-fit rounded-md bg-white/15 px-2 py-1 text-[11px] font-medium leading-none text-white backdrop-blur-sm">
                    Medisigna
                  </p>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-white md:text-3xl">{item.title}</h2>
                    <p className="max-w-md text-sm leading-6 text-white/85 md:text-base">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {promoItems.map((item, index) => (
          <span
            key={item.title}
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-muted-foreground/25 transition-all",
              index === selectedIndex && "w-5 bg-primary"
            )}
          />
        ))}
      </div>
    </section>
  )
}
