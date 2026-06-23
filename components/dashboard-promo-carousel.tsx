"use client"

import * as React from "react"
import { MessageCircleIcon, PillIcon, ShieldCheckIcon } from "lucide-react"

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
    icon: MessageCircleIcon,
  },
  {
    title: "Cek aturan pakai",
    description: "Pastikan dosis, waktu minum, dan cara pakai obat lebih jelas.",
    icon: PillIcon,
  },
  {
    title: "Apoteker terverifikasi",
    description: "Pilih apoteker yang sudah melewati proses verifikasi Medisigna.",
    icon: ShieldCheckIcon,
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
      <Carousel setApi={setApi} opts={{ loop: true }} className="overflow-hidden rounded-xl">
        <CarouselContent>
          {promoItems.map((item) => (
            <CarouselItem key={item.title}>
              <div className="relative flex min-h-40 items-center justify-between gap-4 overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm md:min-h-48 md:p-7">
                <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-primary-foreground/10 md:block" />
                <div className="relative flex max-w-xl flex-col gap-3">
                  <p className="w-fit rounded-md bg-primary-foreground/15 px-2 py-1 text-xs font-medium">
                    Medisigna
                  </p>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{item.title}</h2>
                    <p className="max-w-md text-sm leading-6 text-primary-foreground/85">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="relative hidden size-24 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20 md:flex">
                  <item.icon className="size-10" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="mt-3 flex justify-center gap-2">
        {promoItems.map((item, index) => (
          <span
            key={item.title}
            className={cn(
              "size-1.5 rounded-full bg-muted-foreground/30",
              index === selectedIndex && "bg-primary"
            )}
          />
        ))}
      </div>
    </section>
  )
}
