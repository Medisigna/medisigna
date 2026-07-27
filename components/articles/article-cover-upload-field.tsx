"use client"

import { useRef, useState } from "react"
import { ImageIcon, UploadCloudIcon, XIcon } from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"

type UploadState = "idle" | "uploading" | "error" | "done"

export function ArticleCoverUploadField({
  defaultValue,
}: {
  defaultValue?: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [coverUrl, setCoverUrl] = useState(defaultValue ?? "")
  const [fileName, setFileName] = useState(defaultValue ? "Gambar sampul" : "")
  const [state, setState] = useState<UploadState>(defaultValue ? "done" : "idle")
  const [error, setError] = useState("")

  async function upload(file?: File) {
    if (!file) return

    setFileName(file.name)
    setError("")
    setState("uploading")

    const formData = new FormData()
    formData.set("file", file)

    try {
      const response = await fetch("/api/articles/cover-upload", {
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

      setCoverUrl(result.secureUrl)
      setState("done")
    } catch (uploadError) {
      setCoverUrl("")
      setState("error")
      setError(uploadError instanceof Error ? uploadError.message : "Upload gambar gagal.")
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function clearCover() {
    setCoverUrl("")
    setFileName("")
    setError("")
    setState("idle")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <span>Gambar sampul</span>
      <input type="hidden" name="coverImageUrl" value={coverUrl} readOnly />
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => upload(event.target.files?.[0])}
      />
      <Attachment
        state={state}
        orientation="horizontal"
        className="w-full max-w-xl"
      >
        <AttachmentMedia variant={coverUrl ? "image" : "icon"}>
          {coverUrl ? (
            <img src={coverUrl} alt="Preview gambar sampul" />
          ) : state === "uploading" ? (
            <UploadCloudIcon />
          ) : (
            <ImageIcon />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>
            {state === "uploading"
              ? "Mengupload gambar..."
              : fileName || "Pilih gambar sampul"}
          </AttachmentTitle>
          <AttachmentDescription>
            {error || (coverUrl ? "Upload berhasil." : "PNG, JPG, atau WebP.")}
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          {coverUrl ? (
            <AttachmentAction
              type="button"
              variant="ghost"
              aria-label="Hapus gambar"
              onClick={clearCover}
            >
              <XIcon />
            </AttachmentAction>
          ) : null}
        </AttachmentActions>
        <AttachmentTrigger
          aria-label="Upload gambar sampul"
          onClick={() => inputRef.current?.click()}
        />
      </Attachment>
    </div>
  )
}
