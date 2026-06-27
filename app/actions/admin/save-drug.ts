"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, value } from "../shared"

function listValue(formData: FormData, name: string) {
  return value(formData, name)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function optionalText(formData: FormData, name: string) {
  return value(formData, name) || null
}

function dateValue(formData: FormData, name: string) {
  const raw = value(formData, name)
  if (!raw) return null

  const date = new Date(`${raw}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

async function requireVerifiedReviewer(reviewerId: string, path: string) {
  const reviewer = await db.user.findFirst({
    where: {
      id: reviewerId,
      role: "PHARMACIST",
      pharmacistProfile: { is: { verificationStatus: "VERIFIED" } },
    },
    select: { id: true },
  })

  if (!reviewer) fail(path, "Reviewer harus apoteker terverifikasi.")
}

export async function saveDrug(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const path = id ? `/admin/obat/${id}` : "/admin/obat/new"
  const genericName = value(formData, "genericName")
  const slug = value(formData, "slug").toLowerCase()
  const uses = value(formData, "uses")
  const generalUsage = value(formData, "generalUsage")
  const reviewerId = value(formData, "reviewerId")
  const reviewedAt = dateValue(formData, "reviewedAt")
  const reviewDueAt = dateValue(formData, "reviewDueAt")
  const status = value(formData, "status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT"

  if (!genericName) fail(path, "Nama generik wajib diisi.")
  if (!slug) fail(path, "Slug wajib diisi.")
  if (!uses) fail(path, "Kegunaan umum wajib diisi.")
  if (!generalUsage) fail(path, "Cara pakai umum wajib diisi.")
  if (!reviewerId) fail(path, "Reviewer wajib dipilih.")
  if (!reviewedAt) fail(path, "Tanggal review wajib diisi.")
  await requireVerifiedReviewer(reviewerId, path)

  const duplicate = await db.drugInformation.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  })

  if (duplicate) fail(path, "Slug sudah digunakan.")
  if (status === "PUBLISHED") {
    await requireVerifiedReviewer(reviewerId, path)
  }

  const data = {
    genericName,
    slug,
    brandNames: listValue(formData, "brandNames"),
    aliases: listValue(formData, "aliases"),
    drugClass: optionalText(formData, "drugClass"),
    dosageForm: optionalText(formData, "dosageForm"),
    isDemo: value(formData, "isDemo") === "true",
    status,
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
    reviewerId,
    reviewedAt,
    reviewDueAt,
  }

  const drug = id
    ? await db.drugInformation.update({ where: { id }, data, select: { id: true } })
    : await db.drugInformation.create({ data, select: { id: true } })

  revalidatePath("/admin/obat")
  revalidatePath(`/admin/obat/${drug.id}`)
  revalidatePath("/obat")
  redirect(`/admin/obat/${drug.id}?success=${encodeURIComponent("Informasi obat tersimpan.")}`)
}
