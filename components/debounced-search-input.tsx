"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export function DebouncedSearchInput({
  action,
  query,
  placeholder,
  ariaLabel,
  hiddenParams = {},
  inputGroupClassName,
  debounceMs = 400,
}: {
  action: string
  query: string
  placeholder: string
  ariaLabel: string
  hiddenParams?: Record<string, string | undefined>
  inputGroupClassName?: string
  debounceMs?: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(query)

  useEffect(() => {
    setValue(query)
  }, [query])

  useEffect(() => {
    const nextQuery = value.trim()
    if (nextQuery === query) return

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      params.delete("page")
      if (nextQuery) {
        params.set("q", nextQuery)
      } else {
        params.delete("q")
      }

      for (const [key, paramValue] of Object.entries(hiddenParams)) {
        if (paramValue) {
          params.set(key, paramValue)
        } else {
          params.delete(key)
        }
      }

      const href = params.size ? `${action}?${params.toString()}` : action
      router.replace(href, { scroll: pathname !== action })
    }, debounceMs)

    return () => window.clearTimeout(timer)
  }, [
    action,
    debounceMs,
    hiddenParams,
    pathname,
    query,
    router,
    searchParams,
    value,
  ])

  return (
    <InputGroup className={inputGroupClassName}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        name="q"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {Object.entries(hiddenParams).map(([key, paramValue]) =>
        paramValue ? <input key={key} type="hidden" name={key} value={paramValue} /> : null
      )}
    </InputGroup>
  )
}
