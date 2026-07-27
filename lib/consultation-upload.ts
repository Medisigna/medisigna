import { uploadImageToCloudinary } from "@/lib/cloudinary-upload"

export async function saveConsultationImage(file: File): Promise<{
  fileUrl: string
  fileType: string
  fileName: string
}> {
  const fileUrl = await uploadImageToCloudinary(file, "medisigna/consultations")

  return {
    fileUrl,
    fileType: file.type,
    fileName: file.name,
  }
}
