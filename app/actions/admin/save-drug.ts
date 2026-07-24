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

async function verifiedReviewerId(path: string, reviewerId?: string) {
  if (reviewerId) {
    await requireVerifiedReviewer(reviewerId, path)
    return reviewerId
  }

  const reviewer = await db.user.findFirst({
    where: {
      role: "PHARMACIST",
      pharmacistProfile: { is: { verificationStatus: "VERIFIED" } },
    },
    select: { id: true },
    orderBy: { name: "asc" },
  })

  if (!reviewer) fail(path, "Reviewer apoteker terverifikasi belum tersedia.")
  return reviewer.id
}

export async function saveDrug(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const path = id ? `/admin/obat/${id}` : "/admin/obat/new"
  const genericName = value(formData, "genericName")
  const uses = value(formData, "uses")
  const generalUsage = value(formData, "generalUsage")
  const rawReviewerId = value(formData, "reviewerId")
  const reviewedAt = dateValue(formData, "reviewedAt")
  const reviewDueAt = formData.has("reviewDueAt")
    ? dateValue(formData, "reviewDueAt")
    : undefined
  const rawStatus = value(formData, "status")
  const status =
    rawStatus === "PUBLISHED" || rawStatus === "REJECTED" ? rawStatus : "DRAFT"

  if (!genericName) fail(path, "Nama generik wajib diisi.")
  if (!uses) fail(path, "Kegunaan umum wajib diisi.")
  if (!generalUsage) fail(path, "Cara pakai umum wajib diisi.")
  if (!reviewedAt) fail(path, "Tanggal review wajib diisi.")
  const reviewerId = await verifiedReviewerId(path, rawReviewerId)

  if (status === "PUBLISHED") {
    await requireVerifiedReviewer(reviewerId, path)
  }

  const slug = await uniqueDrugSlug(genericName, id || undefined)
  const data = {
    genericName,
    slug,
    brandNames: listValue(formData, "brandNames"),
    aliases: listValue(formData, "aliases"),
    drugClass: optionalText(formData, "drugClass"),
    dosageForm: optionalText(formData, "dosageForm"),
    isDemo: value(formData, "isDemo") === "true",
    status: status as "DRAFT",
    uses,
    generalUsage,
    foodGuidance: optionalText(formData, "foodGuidance"),
    commonSideEffects: value(formData, "commonSideEffects"),
    warnings: value(formData, "warnings"),
    seekHelpWhen: value(formData, "seekHelpWhen"),
    definition: optionalText(formData, "definition"),
    pharmacology: optionalText(formData, "pharmacology"),
    formulation: optionalText(formData, "formulation"),
    indicationsAndDosage: optionalText(formData, "indicationsAndDosage"),
    sideEffectsAndInteractions: optionalText(
      formData,
      "sideEffectsAndInteractions"
    ),
    pregnancyUse: optionalText(formData, "pregnancyUse"),
    contraindicationsAndWarnings: optionalText(
      formData,
      "contraindicationsAndWarnings"
    ),
    clinicalMonitoring: optionalText(formData, "clinicalMonitoring"),
    counselingPointsMarkdown: optionalText(formData, "counselingPointsMarkdown"),
    referencesMarkdown: optionalText(formData, "referencesMarkdown"),
    reviewerId,
    reviewedAt,
    ...(reviewDueAt !== undefined ? { reviewDueAt } : {}),
  }

  const drug = id
    ? await db.drugInformation.update({ where: { id }, data, select: { id: true } })
    : await db.drugInformation.create({ data, select: { id: true } })

  revalidatePath("/admin/obat")
  revalidatePath(`/admin/obat/${drug.id}`)
  revalidatePath("/obat")
  redirect(`/admin/obat/${drug.id}?success=${encodeURIComponent("Informasi obat tersimpan.")}`)
}
