"use client"

import { useMemo, useState } from "react"
import { CheckIcon, CopyIcon, LinkIcon, Share2Icon } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

function absoluteUrl(href: string) {
  if (typeof window === "undefined") return href
  return new URL(href, window.location.origin).toString()
}

export function ForumShareDialog({
  href,
  iconOnly = false,
  label = "Bagikan",
  title,
}: {
  href: string
  iconOnly?: boolean
  label?: string
  title: string
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const url = useMemo(() => (open ? absoluteUrl(href) : href), [href, open])
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link disalin.")
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Link gagal disalin.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={iconOnly ? "icon-sm" : "sm"}
          aria-label="Bagikan"
        >
          <Share2Icon data-icon="inline-start" />
          {iconOnly ? null : label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bagikan diskusi</DialogTitle>
          <DialogDescription>Pilih platform atau salin link diskusi.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              <Share2Icon data-icon="inline-start" />
              Facebook
            </a>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              <LinkIcon data-icon="inline-start" />
              LinkedIn
            </a>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <a
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noreferrer"
            >
              <Share2Icon data-icon="inline-start" />
              X
            </a>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <a
              href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              <Share2Icon data-icon="inline-start" />
              WhatsApp
            </a>
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={copyLink}>
            {copied ? (
              <CheckIcon data-icon="inline-start" />
            ) : (
              <CopyIcon data-icon="inline-start" />
            )}
            {copied ? "Tersalin" : "Salin link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
