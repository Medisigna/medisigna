"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

export function SubmissionStatusFilter({
  labels,
  options,
  status,
}: {
  labels: Record<string, string>
  options: readonly string[]
  status: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <select
      name="status"
      value={status}
      onChange={(event) => {
        const nextStatus = event.target.value
        const params = new URLSearchParams(searchParams.toString())

        params.delete("page")
        if (nextStatus === "ALL") {
          params.delete("status")
        } else {
          params.set("status", nextStatus)
        }

        router.replace(params.size ? `${pathname}?${params.toString()}` : pathname)
      }}
      className="h-11 rounded-md border bg-background px-3 text-sm"
      aria-label="Filter status"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  )
}
