import Link from "next/link"
import { XIcon } from "lucide-react"

import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PharmacistSearch({
  action,
  query,
  variant = "default",
}: {
  action: string
  query: string
  variant?: "default" | "soft"
}) {
  const isSoft = variant === "soft"

  return (
    <form action={action} className="flex w-full max-w-md items-center gap-2">
      <DebouncedSearchInput
        action={action}
        query={query}
        placeholder="Cari nama, topik, atau lokasi"
        ariaLabel="Cari apoteker"
        inputGroupClassName={cn(
          "h-11 rounded-2xl",
          isSoft
            ? "border-0 bg-card shadow-none ring-0"
            : "bg-background"
        )}
      />
      {query ? (
        <Button asChild variant="ghost" size="icon-sm" aria-label="Hapus pencarian">
          <Link href={action}>
            <XIcon />
          </Link>
        </Button>
      ) : null}
    </form>
  )
}
