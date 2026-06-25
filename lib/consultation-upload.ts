import { createHash } from "node:crypto"

import { env } from "@/lib/env"

export async function saveConsultationImage(file: File): Promise<{
  fileUrl: string
  fileType: string
  fileName: string
}> {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } =
    env

  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary belum dikonfigurasi.")
  }

  const timestamp = Math.floor(Date.now() / 1000).toString()
  const folder = "medisigna/consultations"
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`)
    .digest("hex")
  const formData = new FormData()

  formData.set("file", file)
  formData.set("api_key", CLOUDINARY_API_KEY)
  formData.set("folder", folder)
  formData.set("timestamp", timestamp)
  formData.set("signature", signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  )

  if (!response.ok) {
    throw new Error(`Cloudinary upload gagal: ${response.status}`)
  }

  const result = (await response.json()) as { secure_url?: string }

  if (!result.secure_url) {
    throw new Error("Cloudinary tidak mengembalikan URL gambar.")
  }

  return {
    fileUrl: result.secure_url,
    fileType: file.type,
    fileName: file.name,
  }
}
