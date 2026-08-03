"use client"

import dynamic from "next/dynamic"
import { ImageIcon } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import { commands, type ICommand, type TextAreaTextApi } from "@uiw/react-md-editor"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

type PendingImageInsert = {
  api: TextAreaTextApi
  selectedText?: string
}

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
  const imageInputRef = useRef<HTMLInputElement>(null)
  const pendingImageInsertRef = useRef<PendingImageInsert | null>(null)
  const [value, setValue] = useState(defaultValue ?? "")
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return

    input.dispatchEvent(new Event("input", { bubbles: true }))
    input.dispatchEvent(new Event("change", { bubbles: true }))
  }, [value])

  const editorCommands = useMemo<ICommand[]>(() => {
    const uploadImageCommand: ICommand = {
      ...commands.image,
      name: "upload-image",
      keyCommand: "upload-image",
      icon: <ImageIcon className="markdown-editor-upload-icon" aria-hidden="true" />,
      buttonProps: {
        "aria-label": isUploadingImage ? "Mengupload gambar" : "Upload gambar",
        title: isUploadingImage ? "Mengupload gambar" : "Upload gambar",
        disabled: isUploadingImage,
      },
      execute: (state, api) => {
        pendingImageInsertRef.current = {
          api,
          selectedText: state.selectedText,
        }
        imageInputRef.current?.click()
      },
    }

    return commands.getCommands().map((command) =>
      command.keyCommand === "image" ? uploadImageCommand : command
    )
  }, [isUploadingImage])

  async function uploadMarkdownImage(file?: File) {
    const pending = pendingImageInsertRef.current
    pendingImageInsertRef.current = null

    if (!file || !pending) return

    setIsUploadingImage(true)

    const formData = new FormData()
    formData.set("file", file)

    try {
      const response = await fetch("/api/markdown/image-upload", {
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

      const alt = pending.selectedText?.trim() || file.name.replace(/\.[^/.]+$/, "") || "Gambar"
      const nextState = pending.api.replaceSelection(`![${alt}](${result.secureUrl})`)
      setValue(nextState.text)
      toast.success("Gambar ditambahkan.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload gambar gagal.")
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      <input ref={inputRef} type="hidden" name={name} value={value} readOnly />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => uploadMarkdownImage(event.target.files?.[0])}
      />
      <div data-color-mode="light">
        <MDEditor
          textareaProps={{ id, "aria-required": required }}
          value={value}
          onChange={(nextValue) => setValue(nextValue ?? "")}
          height={height}
          preview="live"
          commands={editorCommands}
        />
      </div>
    </div>
  )
}
