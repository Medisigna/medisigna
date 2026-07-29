import { uploadImageToCloudinary } from "@/lib/cloudinary-upload"
import sharp from "sharp"

const maxImageDimension = 1200
const webpQuality = 82

function webpFileName(fileName: string) {
  const baseName = fileName.replace(/\.[^/.]+$/, "")
  return `${baseName || "consultation-image"}.webp`
}

async function optimizeConsultationImage(file: File) {
  const input = Buffer.from(await file.arrayBuffer())
  const output = await sharp(input, { limitInputPixels: 64_000_000 })
    .autoOrient()
    .resize(maxImageDimension, maxImageDimension, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: webpQuality })
    .toBuffer()

  return new File([output], webpFileName(file.name), { type: "image/webp" })
}

export async function saveConsultationImage(file: File): Promise<{
  fileUrl: string
  fileType: string
  fileName: string
}> {
  const optimizedFile = await optimizeConsultationImage(file)
  const fileUrl = await uploadImageToCloudinary(
    optimizedFile,
    "medisigna/consultations"
  )

  return {
    fileUrl,
    fileType: optimizedFile.type,
    fileName: optimizedFile.name,
  }
}
