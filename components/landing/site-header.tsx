"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRightIcon, HeartPulseIcon, MenuIcon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

const navItems = [
  ["Artikel", "/artikel"],
  ["Video", "/video"],
  ["Obat A-Z", "/obat"],
  ["Apoteker", "/pharmacists"],
  ["Tentang", "/about"],
  ["FAQ", "/faq"],
  ["Kontak", "/contact"],
]

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [isHeroSurface, setIsHeroSurface] = useState(false)

  useEffect(() => {
    if (!isHome) {
      setIsHeroSurface(false)
      return
    }

    function updateSurface() {
      const hero = document.getElementById("landing-hero")

      if (!hero) {
        setIsHeroSurface(false)
        return
      }

      const rect = hero.getBoundingClientRect()
      setIsHeroSurface(rect.top < 80 && rect.bottom > 72)
    }

    updateSurface()
    window.addEventListener("scroll", updateSurface, { passive: true })
    window.addEventListener("resize", updateSurface)

    return () => {
      window.removeEventListener("scroll", updateSurface)
      window.removeEventListener("resize", updateSurface)
    }
  }, [isHome])

  return (
    <header
      className={cn(
        "top-0 z-30 mt-4 px-4 sm:mt-5 sm:px-6",
        isHome ? "fixed inset-x-0" : "sticky"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm backdrop-blur transition-colors duration-200 sm:px-4",
          isHeroSurface
            ? "border-white/20 bg-white/8 text-white shadow-black/10"
            : "border-border/70 bg-background/70 text-foreground shadow-foreground/5"
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-md shadow-xs transition-colors",
              isHeroSurface
                ? "bg-white text-[#0878ea]"
                : "bg-primary text-primary-foreground"
            )}
          >
            <HeartPulseIcon className="size-4" />
          </span>
          <span className="truncate">Medisigna</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:gap-2 xl:gap-6 md:flex">
          {navItems.map(([label, href]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-2 py-1.5 font-medium transition-colors lg:px-3",
                  isHeroSurface
                    ? "text-white/85 hover:bg-white/15 hover:text-white"
                    : "text-muted-foreground hover:bg-primary hover:text-primary-foreground",
                  active &&
                    (isHeroSurface
                      ? "bg-white text-[#0878ea] hover:bg-white hover:text-[#0878ea]"
                      : "bg-primary text-primary-foreground")
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle
            className={cn(
              isHeroSurface &&
                "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            )}
          />
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "md:hidden",
                  isHeroSurface &&
                    "text-white hover:bg-white/15 hover:text-white"
                )}
                aria-label="Buka navigasi"
              >
                <MenuIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row items-center justify-between">
                <DrawerTitle className="flex items-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                    <HeartPulseIcon className="size-4" />
                  </span>
                  <span>Medisigna</span>
                </DrawerTitle>
                <ThemeToggle />
              </DrawerHeader>
              <nav className="flex flex-col px-4 text-base">
                {navItems.map(([label, href]) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`)

                  return (
                    <DrawerClose key={href} asChild>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "rounded-md px-3 py-4 font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
                          active && "bg-primary text-primary-foreground"
                        )}
                      >
                        {label}
                      </Link>
                    </DrawerClose>
                  )
                })}
              </nav>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/login">Masuk</Link>
                  </Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button asChild>
                    <Link href="/register">Mulai Konsultasi</Link>
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "hidden sm:inline-flex",
              isHeroSurface && "text-white hover:bg-white/15 hover:text-white"
            )}
          >
            <Link href="/login">Masuk</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className={cn(
              "hidden sm:inline-flex",
              isHeroSurface &&
                "bg-white text-[#0878ea] hover:bg-white/90 hover:text-[#0878ea]"
            )}
          >
            <Link href="/pharmacists">
              Mulai Konsultasi
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
