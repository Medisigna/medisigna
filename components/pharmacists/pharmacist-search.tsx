import Link from "next/link"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

export function PharmacistSearch({
  action,
  query,
}: {
  action: string
  query: string
}) {
  return (
    <form action={action} className="flex w-full max-w-md items-center gap-2">
      <InputGroup className="bg-background">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Cari nama, topik, atau lokasi"
          aria-label="Cari apoteker"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton type="submit">Cari</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
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
