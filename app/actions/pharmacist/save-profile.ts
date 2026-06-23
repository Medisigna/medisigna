"use server"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fileDataUrl, ok, requireText, splitTopics, value } from "../shared"

export async function savePharmacistProfile(formData: FormData) {
  const user = await requireRole("PHARMACIST")
  const path = "/pharmacist/dashboard"
  const existing = await db.pharmacistProfile.findUnique({ where: { userId: user.id } })
  const profilePhotoUrl =
    (await fileDataUrl(formData, "profilePhoto", "Foto profil", ["image/png", "image/jpeg", "image/webp"], path, false)) ??
    existing?.profilePhotoUrl
  const strDocumentUrl =
    (await fileDataUrl(formData, "strDocument", "Dokumen STR", ["image/png", "image/jpeg", "image/webp", "application/pdf"], path, false)) ??
    existing?.strDocumentUrl

  const data = {
    title: requireText(formData, "title", "Gelar", path),
    strNumber: requireText(formData, "strNumber", "Nomor STR", path),
    profilePhotoUrl,
    bio: requireText(formData, "bio", "Bio singkat", path),
    topics: splitTopics(requireText(formData, "topics", "Topik bantuan", path)),
    practiceLocation: requireText(formData, "practiceLocation", "Lokasi praktik", path),
    serviceHours: requireText(formData, "serviceHours", "Jam layanan", path),
    experienceSummary: requireText(formData, "experienceSummary", "Pengalaman singkat", path),
    strDocumentUrl,
    availabilityStatus: value(formData, "availabilityStatus") === "ONLINE" ? "ONLINE" : "OFFLINE",
  }

  await db.user.update({
    where: { id: user.id },
    data: { name: requireText(formData, "name", "Nama lengkap", path), image: profilePhotoUrl },
  })

  await db.pharmacistProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, verificationStatus: "PENDING", ...data },
    update: data,
  })

  ok(path)
}
