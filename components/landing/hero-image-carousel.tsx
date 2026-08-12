"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

type HeroCarouselItem = {
  title: string
  image: string
}

export function HeroImageCarousel({ items }: { items: HeroCarouselItem[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!api) return

    const updateSelectedIndex = () => setSelectedIndex(api.selectedScrollSnap())

    updateSelectedIndex()
    api.on("select", updateSelectedIndex)
    api.on("reInit", updateSelectedIndex)

    return () => {
      api.off("select", updateSelectedIndex)
      api.off("reInit", updateSelectedIndex)
    }
  }, [api])

  useEffect(() => {
    if (!api || items.length < 2) return

    const interval = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext()
      else api.scrollTo(0)
    }, 4500)

    return () => window.clearInterval(interval)
  }, [api, items.length])

  return (
    <div
      className="relative isolate mx-auto w-full max-w-sm overflow-hidden rounded-2xl lg:max-w-none"
      aria-label="Sorotan layanan Medisigna"
    >
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={item.title}>
              <Image
                src={item.image}
                alt={item.title}
                width={900}
                height={1100}
                sizes="(min-width: 1024px) 400px, 100vw"
                priority={index === 0}
                className="aspect-[5/6] max-h-72 w-full rounded-2xl object-cover sm:max-h-80 md:max-h-96 lg:max-h-[28rem]"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {items.map((item, index) => (
          <span
            key={item.title}
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-white/45 transition-all",
              index === selectedIndex && "w-5 bg-white"
            )}
          />
        ))}
      </div>
    </div>
  )
}
