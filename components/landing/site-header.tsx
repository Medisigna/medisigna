import Link from "next/link"
import { ArrowRightIcon, HeartPulseIcon, MenuIcon } from "lucide-react"

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

const navItems = [
  ["Tentang", "/about"],
  ["FAQ", "/faq"],
  ["Kontak", "/contact"],
]

export function SiteHeader() {
  return (
    <header className="sticky top-3 z-30 px-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl   bg-transparent px-3 py-2 text-sm shadow-foreground/5 backdrop-blur sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <HeartPulseIcon className="size-4" />
          </span>
          <span className="truncate">Medisigna</span>
        </Link>

        <nav className="hidden items-center gap-6 text-muted-foreground md:flex">
          {navItems.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="font-medium underline-offset-8 transition-colors hover:text-foreground hover:underline"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Buka navigasi">
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
                {navItems.map(([label, href]) => (
                  <DrawerClose key={href} asChild>
                    <Link href={href} className="border-b py-4 font-medium last:border-b-0">
                      {label}
                    </Link>
                  </DrawerClose>
                ))}
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
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/register">
              Konsultasi sekarang
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
