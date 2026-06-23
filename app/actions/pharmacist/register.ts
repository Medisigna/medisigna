"use server"

import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  accountIdentity,
  existingAccount,
  fail,
  fileDataUrl,
  passwordPair,
  requireText,
  splitTopics,
  value,
} from "../shared"

export async function registerPharmacist(formData: FormData) {
  const path = "/register/pharmacist"
  const name = requireText(formData, "name", "Nama lengkap", path)
  const identity = accountIdentity(value(formData, "identifier"), path)
  const password = passwordPair(formData, path)
  const title = requireText(formData, "title", "Gelar", path)
  const strNumber = requireText(formData, "strNumber", "Nomor STR", path)
  const bio = requireText(formData, "bio", "Bio singkat", path)
  const topicsText = requireText(formData, "topics", "Topik bantuan", path)
  const practiceLocation = requireText(formData, "practiceLocation", "Lokasi praktik", path)
  const serviceHours = requireText(formData, "serviceHours", "Jam layanan", path)
  const experienceSummary = requireText(formData, "experienceSummary", "Pengalaman singkat", path)
  const profilePhotoUrl = await fileDataUrl(formData, "profilePhoto", "Foto profil", ["image/png", "image/jpeg", "image/webp"], path)
  const strDocumentUrl = await fileDataUrl(formData, "strDocument", "Dokumen STR", ["image/png", "image/jpeg", "image/webp", "application/pdf"], path)

  if (await existingAccount(identity.email, identity.phone)) {
    fail(path, "Email atau nomor WhatsApp sudah dipakai.")
  }

  if (await db.pharmacistProfile.findUnique({ where: { strNumber } })) {
    fail(path, "Nomor STR sudah terdaftar.")
  }

  try {
    const result = (await auth.api.signUpEmail({
      body: {
        name,
        email: identity.email,
        password,
        phone: identity.phone,
        role: "PHARMACIST",
        status: "ACTIVE",
        image: profilePhotoUrl,
      },
    })) as { user?: { id?: string } }

    const userId = result.user?.id
    if (!userId) fail(path, "Registrasi gagal. Coba lagi.")

    await db.user.update({
      where: { id: userId },
      data: { phone: identity.phone, role: "PHARMACIST", status: "ACTIVE", image: profilePhotoUrl },
    })
    await db.pharmacistProfile.create({
      data: {
        userId,
        title,
        strNumber,
        profilePhotoUrl,
        bio,
        topics: splitTopics(topicsText),
        practiceLocation,
        serviceHours,
        experienceSummary,
        strDocumentUrl,
        verificationStatus: "PENDING",
        availabilityStatus: "OFFLINE",
      },
    })
  } catch {
    fail(path, "Registrasi apoteker gagal. Periksa data lalu coba lagi.")
  }

  redirect("/pharmacist/status")
}
