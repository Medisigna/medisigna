"use client"

import { ChangeEvent, useEffect, useId, useRef, useState } from "react"
import { FileTextIcon, ImageIcon, UploadCloudIcon, XIcon } from "lucide-react"

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
import { Input } from "@/components/ui/input"

type RegistrationFileFieldProps = {
  name: string
  label: string
  accept: string
  description: string
  required?: boolean
  imageOnly?: boolean
}

export function RegistrationFileField({
  name,
  label,
  accept,
  description,
  required = false,
  imageOnly = false,
}: RegistrationFileFieldProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [isImage, setIsImage] = useState(false)

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    setFileName(file?.name ?? "")
    setIsImage(Boolean(file?.type.startsWith("image/")))
    setPreviewUrl(file ? URL.createObjectURL(file) : "")
  }

  function clearFile() {
    setFileName("")
    setPreviewUrl("")
    setIsImage(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <span>{label}</span>
      <Input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="sr-only"
        onChange={handleChange}
      />
      <Attachment state={fileName ? "done" : "idle"} className="w-full">
        <AttachmentMedia variant={isImage && previewUrl ? "image" : "icon"}>
          {isImage && previewUrl ? (
            <img src={previewUrl} alt={`Preview ${label.toLowerCase()}`} />
          ) : fileName ? (
            <FileTextIcon />
          ) : imageOnly ? (
            <ImageIcon />
          ) : (
            <UploadCloudIcon />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{fileName || `Pilih ${label.toLowerCase()}`}</AttachmentTitle>
          <AttachmentDescription>{fileName ? "File siap dikirim." : description}</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          {fileName ? (
            <AttachmentAction type="button" aria-label={`Hapus ${label.toLowerCase()}`} onClick={clearFile}>
              <XIcon />
            </AttachmentAction>
          ) : null}
        </AttachmentActions>
        <AttachmentTrigger aria-label={`Upload ${label.toLowerCase()}`} onClick={() => inputRef.current?.click()} />
      </Attachment>
    </div>
  )
}
