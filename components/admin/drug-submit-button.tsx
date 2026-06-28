"use client"

import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function isComplete(form: HTMLFormElement, names: string[]) {
  return names.every((name) => {
    const field = form.elements.namedItem(name)
    if (!field) return false

    if (field instanceof RadioNodeList) {
      return field.value.trim().length > 0
    }

    return "value" in field && String(field.value).trim().length > 0
  })
}

export function DrugSubmitButton({
  label,
  loadingLabel,
  requiredNames,
}: {
  label: string
  loadingLabel: string
  requiredNames: string[]
}) {
  const { pending } = useFormStatus()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const form = buttonRef.current?.form
    if (!form) return

    const update = () => setComplete(isComplete(form, requiredNames))
    update()
    form.addEventListener("input", update)
    form.addEventListener("change", update)

    return () => {
      form.removeEventListener("input", update)
      form.removeEventListener("change", update)
    }
  }, [requiredNames])

  return (
    <Button ref={buttonRef} type="submit" disabled={!complete || pending}>
      {pending ? (
        <>
          <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  )
}
