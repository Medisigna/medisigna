"use client"

import dynamic from "next/dynamic"
import { useEffect, useId, useRef, useState } from "react"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export function MarkdownEditorField({
  name,
  label,
  defaultValue,
  required,
  height = 240,
}: {
  name: string
  label: string
  defaultValue?: string | null
  required?: boolean
  height?: number
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue ?? "")

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
  }, [value])

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <label htmlFor={id}>{label}</label>
      <input ref={inputRef} type="hidden" name={name} value={value} readOnly />
      <div data-color-mode="light">
        <MDEditor
          textareaProps={{ id, "aria-required": required }}
          value={value}
          onChange={(nextValue) => setValue(nextValue ?? "")}
          height={height}
          preview="edit"
        />
      </div>
    </div>
  )
}
