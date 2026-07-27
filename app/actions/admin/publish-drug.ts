"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, ok, value } from "../shared"

type ReviewDrug = {
  id: string
  slug: string
  reviewedAt: Date | null
  revisesDrugId: string | null
  reviewerVerificationStatus: string | null
}

type RevisionDrug = {
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

export async function publishDrug(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const action = value(formData, "action")
  const adminNote = value(formData, "adminNote")
  const path = id ? `/admin/obat/${id}` : "/admin/obat"

  if (!id) fail("/admin/obat", "Obat tidak ditemukan.")

  const drug = (
    await db.$queryRaw<ReviewDrug[]>`
      SELECT
        d.id,
        d.slug,
        d."reviewedAt",
        d."revisesDrugId",
        pharmacist_profile."verificationStatus"::text AS "reviewerVerificationStatus"
      FROM "DrugInformation" d
      JOIN "user" reviewer ON reviewer.id = d."reviewerId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = reviewer.id
      WHERE d.id = ${id}
      LIMIT 1
    `
  )[0]

  if (!drug) fail("/admin/obat", "Obat tidak ditemukan.")

  if (action === "publish") {
    if (!drug.reviewedAt) fail(path, "Tanggal review wajib diisi sebelum terbit.")
    if (drug.reviewerVerificationStatus !== "VERIFIED") {
      fail(path, "Reviewer harus apoteker terverifikasi.")
    }

    if (drug.revisesDrugId) {
      const [revision, target] = await Promise.all([
        db.$queryRaw<RevisionDrug[]>`
          SELECT
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
          LIMIT 1
        `,
        db.drugInformation.findUnique({
          where: { id: drug.revisesDrugId },
          select: { slug: true },
        }),
      ])

      if (!revision[0] || !target) fail(path, "Revisi obat tidak lengkap.")

      await db.$transaction([
        db.drugInformation.update({
          where: { id: drug.revisesDrugId },
          data: {
            ...revision[0],
            status: "PUBLISHED",
            adminNote: null,
          } as never,
        }),
        db.drugInformation.update({
          where: { id },
          data: { status: "ARCHIVED", adminNote: null } as never,
        }),
      ])

      revalidatePath("/obat")
      revalidatePath(`/obat/${target.slug}`)
      revalidatePath("/admin/obat")
      revalidatePath("/pharmacist/dashboard/tulis-obat")
      ok(`/admin/obat/${drug.revisesDrugId}`, "Revisi obat diterbitkan.")
    }

    await db.drugInformation.update({
      where: { id },
      data: { status: "PUBLISHED", adminNote: null } as never,
    })

    revalidatePath("/obat")
    revalidatePath(`/obat/${drug.slug}`)
    revalidatePath("/admin/obat")
    revalidatePath("/pharmacist/dashboard/tulis-obat")
    ok(path, "Informasi obat diterbitkan.")
  }

  if (action === "reject") {
    if (!adminNote) fail(path, "Catatan penolakan wajib diisi.")

    await db.drugInformation.update({
      where: { id },
      data: { status: "REJECTED", adminNote } as never,
    })

    revalidatePath("/obat")
    revalidatePath(`/obat/${drug.slug}`)
    revalidatePath("/admin/obat")
    revalidatePath("/pharmacist/dashboard/tulis-obat")
    ok(path, "Informasi obat ditolak.")
  }

  await db.drugInformation.update({
    where: { id },
    data: { status: "DRAFT", adminNote: null } as never,
  })

  revalidatePath("/obat")
  revalidatePath(`/obat/${drug.slug}`)
  revalidatePath("/admin/obat")
  revalidatePath("/pharmacist/dashboard/tulis-obat")
  ok(path, "Informasi obat dijadikan draft.")
}
