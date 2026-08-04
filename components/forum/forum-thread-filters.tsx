"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CheckIcon, SlidersHorizontalIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { ForumCategoryItem } from "@/lib/forum"
import { cn } from "@/lib/utils"

function categoryLabel(categories: ForumCategoryItem[], category?: string) {
  if (!category) return "Kategori"
  return categories.find((item) => item.slug === category)?.name ?? "Kategori"
}

export function ForumThreadFilters({
  categories,
  category,
  query,
  variant = "default",
}: {
  categories: ForumCategoryItem[]
  category?: string
  query?: string
  variant?: "default" | "soft"
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState(query ?? "")
  const [isPending, startTransition] = useTransition()
  const selectedCategoryLabel = useMemo(
    () => categoryLabel(categories, category),
    [categories, category]
  )
  const isSoft = variant === "soft"

  function replaceParams(next: { category?: string; query?: string }) {
    const params = new URLSearchParams()
    const nextQuery = next.query?.trim()

    if (next.category) params.set("category", next.category)
    if (nextQuery) params.set("q", nextQuery)

    const suffix = params.toString()
    startTransition(() => {
      router.replace(suffix ? `${pathname}?${suffix}` : pathname, {
        scroll: false,
      })
    })
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      replaceParams({ category, query: search })
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [category, search])

  return (
    <div className="flex gap-2">
      <div className="relative min-w-0 flex-1">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari diskusi..."
          aria-label="Cari diskusi"
          className={cn(
            "pl-9",
            isSoft
              ? "rounded-2xl border-0 bg-card shadow-none ring-0"
              : "bg-muted/35"
          )}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            className={cn(isSoft && "rounded-2xl border-0 bg-card shadow-none")}
          >
            <SlidersHorizontalIcon data-icon="inline-start" />
            {selectedCategoryLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => replaceParams({ query: search })}>
              {!category ? <CheckIcon data-icon="inline-start" /> : null}
              Semua kategori
            </DropdownMenuItem>
            {categories.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={() =>
                  replaceParams({ category: item.slug, query: search })
                }
              >
                {category === item.slug ? (
                  <CheckIcon data-icon="inline-start" />
                ) : null}
                {item.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
