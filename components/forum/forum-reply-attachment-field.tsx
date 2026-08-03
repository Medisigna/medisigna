"use client"

import { useRef, useState } from "react"
import { ImageIcon, XIcon } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

type ForumReplyAttachment = {
  altText: string
  fileName: string
  fileUrl: string
  isInline: false
}

export function ForumReplyAttachmentField({
  disabled,
}: {
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<ForumReplyAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  async function uploadAttachment(file?: File) {
    if (!file || disabled) return
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.set("file", file)

      const response = await fetch("/api/markdown/upload", {
        method: "POST",
        body: formData,
      })
      const result = (await response.json()) as {
        secureUrl?: string
        error?: string
      }

      if (!response.ok || !result.secureUrl) {
        throw new Error(result.error || "Upload gambar gagal.")
      }

      const secureUrl = result.secureUrl
      const alt = file.name.replace(/\.[^/.]+$/, "") || "Gambar"
      setAttachments((current) => [
        ...current,
        {
          altText: alt,
          fileName: file.name || alt,
          fileUrl: secureUrl,
          isInline: false,
        },
      ])
      toast.success("Gambar diupload.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload gambar gagal.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function removeAttachment(fileUrl: string) {
    setAttachments((current) => current.filter((attachment) => attachment.fileUrl !== fileUrl))
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="hidden"
        name="forumAttachments"
        value={JSON.stringify(attachments)}
        readOnly
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => uploadAttachment(event.target.files?.[0])}
      />
      {attachments.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {attachments.map((attachment) => (
            <figure
              key={attachment.fileUrl}
              className="relative overflow-hidden rounded-md border bg-muted/20"
            >
              <img
                src={attachment.fileUrl}
                alt={attachment.altText}
                className="aspect-video w-full object-cover"
              />
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                className="absolute right-1 top-1"
                aria-label="Hapus gambar"
                onClick={() => removeAttachment(attachment.fileUrl)}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </figure>
          ))}
        </div>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit"
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon data-icon="inline-start" />
        {isUploading ? "Mengupload..." : "Tambah gambar"}
      </Button>
    </div>
  )
}
