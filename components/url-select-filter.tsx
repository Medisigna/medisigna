"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function UrlSelectFilter({
  ariaLabel,
  labels,
  options,
  paramName,
  value,
  emptyValue = "ALL",
}: {
  ariaLabel: string
  labels: Record<string, string>
  options: readonly string[]
  paramName: string
  value: string
  emptyValue?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <select
      name={paramName}
      value={value}
      onChange={(event) => {
        const nextValue = event.target.value
        const params = new URLSearchParams(searchParams.toString())

        params.delete("page")
        if (nextValue === emptyValue) {
          params.delete(paramName)
        } else {
          params.set(paramName, nextValue)
        }

        router.replace(params.size ? `${pathname}?${params.toString()}` : pathname)
      }}
      className="h-11 rounded-md border bg-background px-3 text-sm"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  )
}
