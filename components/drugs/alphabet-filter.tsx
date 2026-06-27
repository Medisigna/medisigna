import Link from "next/link"

import { cn } from "@/lib/utils"

export const alphabetLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function parseAlphabetLetter(value: string | string[] | undefined) {
  if (typeof value !== "string") return ""

  const letter = value.toUpperCase()
  return alphabetLetters.includes(letter) ? letter : ""
}

export function AlphabetFilter({
  activeLetter,
  hrefForLetter,
}: {
  activeLetter: string
  hrefForLetter: (letter: string) => string
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold tracking-tight">Cari berdasarkan abjad</h2>
      <div className="flex flex-wrap gap-3">
        {alphabetLetters.map((letter) => (
          <Link
            key={letter}
            href={hrefForLetter(letter)}
            className={cn(
              "flex size-11 items-center justify-center bg-muted text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground",
              activeLetter === letter && "bg-primary text-primary-foreground"
            )}
          >
            {letter}
          </Link>
        ))}
      </div>
    </section>
  )
}
