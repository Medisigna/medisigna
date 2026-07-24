import Link from "next/link"
import { XIcon } from "lucide-react"

import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { Button } from "@/components/ui/button"

export function PharmacistSearch({
  action,
  query,
}: {
  action: string
  query: string
}) {
  return (
    <form action={action} className="flex w-full max-w-md items-center gap-2">
      <DebouncedSearchInput
        action={action}
        query={query}
        placeholder="Cari nama, topik, atau lokasi"
        ariaLabel="Cari apoteker"
        inputGroupClassName="bg-background"
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
