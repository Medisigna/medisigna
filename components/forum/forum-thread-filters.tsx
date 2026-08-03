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

function categoryLabel(categories: ForumCategoryItem[], category?: string) {
  if (!category) return "Kategori"
  return categories.find((item) => item.slug === category)?.name ?? "Kategori"
}

export function ForumThreadFilters({
  categories,
  category,
  query,
}: {
  categories: ForumCategoryItem[]
  category?: string
  query?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState(query ?? "")
  const [isPending, startTransition] = useTransition()
  const selectedCategoryLabel = useMemo(
    () => categoryLabel(categories, category),
    [categories, category]
  )

  function replaceParams(next: { category?: string; query?: string }) {
    const params = new URLSearchParams()
    const nextQuery = next.query?.trim()

    if (next.category) params.set("category", next.category)
    if (nextQuery) params.set("q", nextQuery)

    const suffix = params.toString()
    startTransition(() => {
      router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false })
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
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari diskusi..."
          aria-label="Cari diskusi"
          className="bg-muted/35 pl-9"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" disabled={isPending}>
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
                onSelect={() => replaceParams({ category: item.slug, query: search })}
              >
                {category === item.slug ? <CheckIcon data-icon="inline-start" /> : null}
                {item.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
