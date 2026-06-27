"use client"

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
  ["Informasi Obat", "/obat"],
  ["Apoteker", "/pharmacists"],
  ["Tentang", "/about"],
  ["FAQ", "/faq"],
  ["Kontak", "/contact"],
]

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-3 z-30 px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl border-1 bg-transparent px-3 py-2 text-sm shadow-foreground/5 backdrop-blur sm:px-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <HeartPulseIcon className="size-4" />
          </span>
          <span className="truncate">Medisigna</span>
        </Link>

        <nav className="hidden items-center gap-6 text-muted-foreground md:flex">
          {navItems.map(([label, href]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
                  active && "bg-primary text-primary-foreground"
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                aria-label="Buka navigasi"
              >
                <MenuIcon />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="flex items-center justify-center gap-2">
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
                    <HeartPulseIcon className="size-4" />
                  </span>
                  <span>Medisigna</span>
                </DrawerTitle>
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
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
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
            className="hidden sm:inline-flex"
          >
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
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
