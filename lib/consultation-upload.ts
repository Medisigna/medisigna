import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const uploadDir = path.join(process.cwd(), "public", "uploads", "consultations")
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export async function saveConsultationImage(file: File): Promise<{
  fileUrl: string
  fileType: string
  fileName: string
}> {
  const extension = extensions[file.type] ?? "bin"
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, fileName), buffer)

  return {
    fileUrl: `/uploads/consultations/${fileName}`,
    fileType: file.type,
    fileName,
  }
}
