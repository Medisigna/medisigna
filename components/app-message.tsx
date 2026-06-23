"use client"

import { useEffect } from "react"
import toast, { Toaster } from "react-hot-toast"

export function AppMessage({
  error,
  success,
}: {
  error?: string | string[]
  success?: string | string[]
}) {
  const text = Array.isArray(error) ? error[0] : error || (Array.isArray(success) ? success[0] : success)
  const type = error ? "error" : "success"

  useEffect(() => {
    if (!text) return
    toast[type](text, { id: `${type}:${text}` })
  }, [text, type])

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: "border border-border bg-card text-card-foreground shadow-sm",
      }}
    />
  )
}
