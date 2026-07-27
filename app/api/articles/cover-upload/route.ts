import { NextResponse } from "next/server"

import { uploadImageToCloudinary } from "@/lib/cloudinary-upload"
import { env } from "@/lib/env"
import { requireRole } from "@/lib/session"

const allowedTypes = ["image/png", "image/jpeg", "image/webp"]

export async function POST(request: Request) {
  const user = await requireRole("PHARMACIST")

  if (user.pharmacistProfile?.verificationStatus !== "VERIFIED") {
    return NextResponse.json(
      { error: "Akun apoteker harus terverifikasi untuk upload gambar." },
      { status: 403 }
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Gambar wajib dipilih." }, { status: 400 })
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Format gambar harus PNG, JPG, atau WebP." },
      { status: 400 }
    )
  }

  const maxBytes = (env.UPLOAD_MAX_SIZE_MB ?? 2) * 1024 * 1024
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `Gambar maksimal ${env.UPLOAD_MAX_SIZE_MB ?? 2}MB.` },
      { status: 400 }
    )
  }

  try {
    const secureUrl = await uploadImageToCloudinary(file, "medisigna/articles")
    return NextResponse.json({ secureUrl })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload gambar gagal.",
      },
      { status: 500 }
    )
  }
}
