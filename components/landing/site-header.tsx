"use client"

import { useCallback, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowRightIcon,
  FileTextIcon,
  MenuIcon,
  PlayCircleIcon,
} from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const educationItems = [
  {
    label: "Artikel",
    href: "/artikel",
    description: "Bacaan edukasi obat dari apoteker.",
    icon: FileTextIcon,
  },
  {
    label: "Video",
    href: "/video",
    description: "Video edukasi singkat dan mudah diikuti.",
    icon: PlayCircleIcon,
  },
]

const navItems = [
  ["Obat A-Z", "/obat"],
  ["Konsultasi", "/pharmacists"],
  ["Forum", "/forum"],
  ["Tentang", "/about"],
  ["FAQ", "/faq"],
  ["Kontak", "/contact"],
]

const mobileNavSections = [
  {
    label: "Layanan",
    items: [
      ["Konsultasi", "/pharmacists"],
      ["Obat A-Z", "/obat"],
      ["Forum", "/forum"],
    ],
  },
  {
    label: "Edukasi",
    items: educationItems.map((item) => [item.label, item.href]),
  },
  {
    label: "Informasi",
    items: [
      ["Tentang", "/about"],
      ["FAQ", "/faq"],
      ["Kontak", "/contact"],
    ],
  },
]

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  const subscribeToSurface = useCallback(
    (onStoreChange: () => void) => {
      if (!isHome) {
        return () => {}
      }

      window.addEventListener("scroll", onStoreChange, { passive: true })
      window.addEventListener("resize", onStoreChange)

      return () => {
        window.removeEventListener("scroll", onStoreChange)
        window.removeEventListener("resize", onStoreChange)
      }
    },
    [isHome]
  )

  const getHeroSurfaceSnapshot = useCallback(() => {
    if (!isHome) {
      return false
    }

    const heroSurface = document.getElementById("landing-hero-surface")

    if (!heroSurface) {
      return false
    }

    const rect = heroSurface.getBoundingClientRect()
    return rect.top < 80 && rect.bottom > 24
  }, [isHome])

  const isHeroSurface = useSyncExternalStore(
    subscribeToSurface,
    getHeroSurfaceSnapshot,
    () => false
  )

  return (
    <header
      className={cn(
        "top-0 z-30 mt-4 px-4 sm:mt-5 sm:px-6",
        isHome ? "fixed inset-x-0" : "sticky"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm backdrop-blur transition-colors duration-200 sm:px-4",
          isHeroSurface
            ? "bg-white/8 text-white"
            : "bg-card text-foreground"
        )}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold"
        >
          <BrandLogo className="size-9" />
          <span className="truncate">Medisigna</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:gap-2 xl:gap-6 md:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    isHeroSurface
                      ? "text-white/85 hover:bg-white/15 hover:text-white data-open:bg-white data-open:text-[#0878ea] data-popup-open:bg-white data-popup-open:text-[#0878ea]"
                      : "text-muted-foreground hover:bg-primary hover:text-primary-foreground data-open:bg-primary data-open:text-primary-foreground data-popup-open:bg-primary data-popup-open:text-primary-foreground",
                    educationItems.some(
                      (item) =>
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                    ) &&
                      (isHeroSurface
                        ? "bg-white text-[#0878ea] hover:bg-white hover:text-[#0878ea]"
                        : "bg-primary text-primary-foreground")
                  )}
                >
                  Edukasi
                </NavigationMenuTrigger>
                <NavigationMenuContent className="min-w-72">
                  <div className="grid gap-1">
                    {educationItems.map((item) => {
                      const Icon = item.icon
                      const active =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)

                      return (
                        <NavigationMenuLink
                          key={item.href}
                          asChild
                          active={active}
                          className="items-start gap-3 p-3"
                        >
                          <Link href={item.href}>
                            <Icon className="mt-0.5 text-primary" />
                            <span className="flex flex-col gap-1">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-xs leading-5 text-muted-foreground">
                                {item.description}
                              </span>
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      )
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
              <DrawerHeader className="flex flex-row items-center">
                <DrawerTitle className="flex items-center gap-2">
                  <BrandLogo className="size-9" />
                  <span>Medisigna</span>
                </DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-5 px-4 pb-2">
                {mobileNavSections.map((section) => (
                  <div key={section.label} className="flex flex-col gap-2">
                    <p className="px-3 text-xs font-medium text-muted-foreground">
                      {section.label}
                    </p>
                    <nav className="flex flex-col text-base">
                      {section.items.map(([label, href]) => {
                        const active =
                          pathname === href || pathname.startsWith(`${href}/`)

                        return (
                          <DrawerClose key={href} asChild>
                            <Link
                              href={href}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "rounded-md px-3 py-3 font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
                                active && "bg-primary text-primary-foreground"
                              )}
                            >
                              {label}
                            </Link>
                          </DrawerClose>
                        )
                      })}
                    </nav>
                  </div>
                ))}
              </div>
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
