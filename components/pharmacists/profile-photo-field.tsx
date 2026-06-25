"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { CameraIcon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ProfilePhotoField({
  currentImage,
  name,
}: {
  currentImage?: string | null
  name: string
}) {
  const [preview, setPreview] = useState(currentImage ?? "")
  const [fileName, setFileName] = useState("")

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setFileName(file?.name ?? "")
    setPreview(file ? URL.createObjectURL(file) : (currentImage ?? ""))
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/20 p-5 text-center sm:flex-row sm:text-left">
      <Avatar className="size-24">
        <AvatarImage src={preview || undefined} alt={`Foto profil ${name}`} />
        <AvatarFallback className="text-xl font-semibold">{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-2 sm:items-start">
        <div>
          <p className="font-medium">Foto profil</p>
          <p className="text-sm text-muted-foreground">PNG, JPG, atau WebP.</p>
        </div>
        <Input
          id="profile-photo"
          name="profilePhoto"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={handleChange}
        />
        <Button asChild variant="outline" size="sm">
          <label htmlFor="profile-photo" className="cursor-pointer">
            <CameraIcon data-icon="inline-start" />
            {preview ? "Ganti foto" : "Pilih foto"}
          </label>
        </Button>
        {fileName ? (
          <p className="max-w-full truncate text-xs text-muted-foreground">{fileName}</p>
        ) : null}
      </div>
    </div>
  )
}
