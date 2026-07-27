"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, uniqueDrugSlug, value } from "../shared"

type EditableDrug = {
  id: string
  slug: string
  genericName: string
  status: string
  revisesDrugId: string | null
}

type RevisionSource = {
  id: string
  slug: string
  genericName: string
  brandNames: string[]
  aliases: string[]
  drugClass: string | null
  dosageForm: string | null
  uses: string
  generalUsage: string
  foodGuidance: string | null
  commonSideEffects: string
  warnings: string
  seekHelpWhen: string
  pharmacistIndications: string | null
  counselingPoints: string[]
  screeningQuestions: string[]
  contraindications: string[]
  majorInteractions: string[]
  seriousSideEffects: string[]
  monitoringParameters: string[]
  referralCriteria: string[]
  internalNotes: string | null
  references: string[]
  definition: string | null
  pharmacology: string | null
  formulation: string | null
  indicationsAndDosage: string | null
  sideEffectsAndInteractions: string | null
  pregnancyUse: string | null
  contraindicationsAndWarnings: string | null
  clinicalMonitoring: string | null
  counselingPointsMarkdown: string | null
  referencesMarkdown: string | null
  reviewDueAt: Date | null
  reviewerId: string
  reviewedAt: Date
  isDemo: boolean
}

function listValue(formData: FormData, name: string) {
  return value(formData, name)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function optionalText(formData: FormData, name: string) {
  return value(formData, name) || null
}

function drugFormData({
  formData,
  genericName,
  slug,
}: {
  formData: FormData
  genericName: string
  slug: string
}) {
  return {
    genericName,
    slug,
    brandNames: listValue(formData, "brandNames"),
    aliases: listValue(formData, "aliases"),
    drugClass: optionalText(formData, "drugClass"),
    dosageForm: optionalText(formData, "dosageForm"),
    isDemo: false,
    status: "DRAFT",
    adminNote: null,
    uses: value(formData, "uses"),
    generalUsage: value(formData, "generalUsage"),
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
    reviewedAt: new Date(),
  }
}

export async function savePharmacistDrug(formData: FormData) {
  const user = await requireRole("PHARMACIST")
  const id = value(formData, "id")
  const path = id
    ? `/pharmacist/dashboard/tulis-obat/${id}/edit`
    : "/pharmacist/dashboard/tulis-obat/new"

  if (user.pharmacistProfile?.verificationStatus !== "VERIFIED") {
    fail(path, "Akun apoteker harus terverifikasi untuk menulis obat.")
  }

  const editable = id
    ? (
        await db.$queryRaw<EditableDrug[]>`
          SELECT
            id,
            slug,
            "genericName",
            status::text AS status,
            "revisesDrugId"
          FROM "DrugInformation"
          WHERE id = ${id}
            AND "reviewerId" = ${user.id}
          LIMIT 1
        `
      )[0]
    : null

  if (id && !editable) fail("/pharmacist/dashboard/tulis-obat", "Obat tidak ditemukan.")
  const canEdit = editable?.status === "REJECTED" || (editable?.revisesDrugId && editable.status === "DRAFT")
  if (editable && !canEdit) {
    fail(`/pharmacist/dashboard/tulis-obat/${editable.id}`, "Hanya tulisan yang ditolak yang bisa diperbaiki.")
  }

  const genericName = editable?.revisesDrugId ? editable.genericName : value(formData, "genericName")
  const uses = value(formData, "uses")
  const generalUsage = value(formData, "generalUsage")

  if (!genericName) fail(path, "Nama generik wajib diisi.")
  if (!uses) fail(path, "Kegunaan umum wajib diisi.")
  if (!generalUsage) fail(path, "Cara pakai umum wajib diisi.")

  const slug = editable?.revisesDrugId
    ? editable.slug
    : await uniqueDrugSlug(genericName, editable?.id)
  const data = drugFormData({ formData, genericName, slug })

  if (editable) {
    await db.drugInformation.update({
      where: { id: editable.id },
      data: data as never,
    })
  } else {
    await db.drugInformation.create({
      data: { ...data, reviewerId: user.id } as never,
    })
  }

  revalidatePath("/admin/obat")
  revalidatePath("/pharmacist/dashboard/obat")
  revalidatePath("/pharmacist/dashboard/tulis-obat")
  redirect(
    `/pharmacist/dashboard/tulis-obat?success=${encodeURIComponent(
      "Informasi obat dikirim untuk verifikasi admin."
    )}`
  )
}

export async function requestDrugRevision(formData: FormData) {
  const user = await requireRole("PHARMACIST")
  const id = value(formData, "id")
  const path = "/pharmacist/dashboard/tulis-obat"

  if (user.pharmacistProfile?.verificationStatus !== "VERIFIED") {
    fail(path, "Akun apoteker harus terverifikasi untuk mengajukan revisi.")
  }

  if (!id) fail(path, "Obat tidak ditemukan.")

  const activeRevision = (
    await db.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT id, status::text AS status
      FROM "DrugInformation"
      WHERE "revisesDrugId" = ${id}
        AND "reviewerId" = ${user.id}
        AND status::text IN ('DRAFT', 'REJECTED')
      ORDER BY "updatedAt" DESC
      LIMIT 1
    `
  )[0]

  if (activeRevision) {
    const target =
      activeRevision.status === "REJECTED" || activeRevision.status === "DRAFT"
        ? `/pharmacist/dashboard/tulis-obat/${activeRevision.id}/edit`
        : `/pharmacist/dashboard/tulis-obat/${activeRevision.id}`
    redirect(target)
  }

  const source = (
    await db.$queryRaw<RevisionSource[]>`
      SELECT
        id,
        slug,
        "genericName",
        "brandNames",
        aliases,
        "drugClass",
        "dosageForm",
        uses,
        "generalUsage",
        "foodGuidance",
        "commonSideEffects",
        warnings,
        "seekHelpWhen",
        "pharmacistIndications",
        "counselingPoints",
        "screeningQuestions",
        contraindications,
        "majorInteractions",
        "seriousSideEffects",
        "monitoringParameters",
        "referralCriteria",
        "internalNotes",
        "references",
        definition,
        pharmacology,
        formulation,
        "indicationsAndDosage",
        "sideEffectsAndInteractions",
        "pregnancyUse",
        "contraindicationsAndWarnings",
        "clinicalMonitoring",
        "counselingPointsMarkdown",
        "referencesMarkdown",
        "reviewDueAt",
        "reviewerId",
        "reviewedAt",
        "isDemo"
      FROM "DrugInformation"
      WHERE id = ${id}
        AND "reviewerId" = ${user.id}
        AND status::text = 'PUBLISHED'
      LIMIT 1
    `
  )[0]

  if (!source) fail(path, "Obat diterima tidak ditemukan.")

  const revisionSlug = await uniqueDrugSlug(source.genericName)
  const revision = await db.drugInformation.create({
    data: {
      ...source,
      id: undefined,
      slug: revisionSlug,
      status: "DRAFT",
      adminNote: null,
      revisesDrugId: source.id,
      reviewedAt: new Date(),
      createdAt: undefined,
      updatedAt: undefined,
    } as never,
    select: { id: true },
  })

  revalidatePath("/admin/obat")
  revalidatePath("/pharmacist/dashboard/tulis-obat")
  redirect(`/pharmacist/dashboard/tulis-obat/${revision.id}/edit`)
}
