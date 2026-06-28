"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, uniqueDrugSlug, value } from "../shared"

function listValue(formData: FormData, name: string) {
  return value(formData, name)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function optionalText(formData: FormData, name: string) {
  return value(formData, name) || null
}

export async function savePharmacistDrug(formData: FormData) {
  const user = await requireRole("PHARMACIST")
  const path = "/pharmacist/dashboard/tulis-obat/new"

  if (user.pharmacistProfile?.verificationStatus !== "VERIFIED") {
    fail(path, "Akun apoteker harus terverifikasi untuk menulis obat.")
  }

  const genericName = value(formData, "genericName")
  const uses = value(formData, "uses")
  const generalUsage = value(formData, "generalUsage")

  if (!genericName) fail(path, "Nama generik wajib diisi.")
  if (!uses) fail(path, "Kegunaan umum wajib diisi.")
  if (!generalUsage) fail(path, "Cara pakai umum wajib diisi.")

  const slug = await uniqueDrugSlug(genericName)

  await db.drugInformation.create({
    data: {
      genericName,
      slug,
      brandNames: listValue(formData, "brandNames"),
      aliases: listValue(formData, "aliases"),
      drugClass: optionalText(formData, "drugClass"),
      dosageForm: optionalText(formData, "dosageForm"),
      isDemo: false,
      status: "DRAFT",
      uses,
      generalUsage,
      foodGuidance: optionalText(formData, "foodGuidance"),
      commonSideEffects: listValue(formData, "commonSideEffects"),
      warnings: listValue(formData, "warnings"),
      seekHelpWhen: listValue(formData, "seekHelpWhen"),
      pharmacistIndications: optionalText(formData, "pharmacistIndications"),
      counselingPoints: listValue(formData, "counselingPoints"),
      screeningQuestions: listValue(formData, "screeningQuestions"),
      contraindications: listValue(formData, "contraindications"),
      majorInteractions: listValue(formData, "majorInteractions"),
      seriousSideEffects: listValue(formData, "seriousSideEffects"),
      monitoringParameters: listValue(formData, "monitoringParameters"),
      referralCriteria: listValue(formData, "referralCriteria"),
      internalNotes: optionalText(formData, "internalNotes"),
      references: listValue(formData, "references"),
      reviewerId: user.id,
      reviewedAt: new Date(),
    },
  })

  revalidatePath("/admin/obat")
  revalidatePath("/pharmacist/dashboard/obat")
  revalidatePath("/pharmacist/dashboard/tulis-obat")
  redirect(
    `/pharmacist/dashboard/tulis-obat?success=${encodeURIComponent(
      "Informasi obat dikirim untuk verifikasi admin."
    )}`
  )
}
