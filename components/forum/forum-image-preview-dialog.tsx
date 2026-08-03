"use client"

import type { ReactNode } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function ForumImagePreviewDialog({
  alt,
  children,
  src,
  title = "Preview gambar",
}: {
  alt: string
  children: ReactNode
  src: string
  title?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-3 sm:max-w-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <img
          src={src}
          alt={alt}
          className="max-h-[78vh] w-full rounded-lg object-contain"
        />
      </DialogContent>
    </Dialog>
  )
}
