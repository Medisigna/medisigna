import { db } from "@/lib/db"
import type { AdminDrugDetailData, DrugStatus } from "@/lib/drugs"

export type PharmacistSubmissionDetail = AdminDrugDetailData & {
  revisesDrugId: string | null
}

type SubmissionRow = Omit<PharmacistSubmissionDetail, "reviewer"> & {
  reviewerName: string
  reviewerTitle: string | null
  reviewerVerificationStatus: string | null
}

function textList(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function normalizeSubmission(row: SubmissionRow): PharmacistSubmissionDetail {
  return {
    ...row,
    brandNames: textList(row.brandNames),
    aliases: textList(row.aliases),
    counselingPoints: textList(row.counselingPoints),
    screeningQuestions: textList(row.screeningQuestions),
    contraindications: textList(row.contraindications),
    majorInteractions: textList(row.majorInteractions),
    seriousSideEffects: textList(row.seriousSideEffects),
    monitoringParameters: textList(row.monitoringParameters),
    referralCriteria: textList(row.referralCriteria),
    references: textList(row.references),
    status: row.status as DrugStatus,
    reviewer: {
      name: row.reviewerName,
      pharmacistProfile: {
        title: row.reviewerTitle ?? "",
        verificationStatus: row.reviewerVerificationStatus ?? "",
      },
    },
  }
}

export async function getPharmacistDrugSubmission(id: string, userId: string) {
  const row = (
    await db.$queryRaw<SubmissionRow[]>`
      SELECT
        d.id,
        d.slug,
        d."genericName",
        d."brandNames",
        d.aliases,
        d."drugClass",
        d."dosageForm",
        d.uses,
        d."generalUsage",
        d."foodGuidance",
        d."commonSideEffects",
        d.warnings,
        d."seekHelpWhen",
        d."pharmacistIndications",
        d."counselingPoints",
        d."screeningQuestions",
        d.contraindications,
        d."majorInteractions",
        d."seriousSideEffects",
        d."monitoringParameters",
        d."referralCriteria",
        d."internalNotes",
        d."references",
        d.definition,
        d.pharmacology,
        d.formulation,
        d."indicationsAndDosage",
        d."sideEffectsAndInteractions",
        d."pregnancyUse",
        d."contraindicationsAndWarnings",
        d."clinicalMonitoring",
        d."counselingPointsMarkdown",
        d."referencesMarkdown",
        d."reviewDueAt",
        d."reviewerId",
        d."reviewedAt",
        d.status::text AS status,
        d."adminNote",
        d."revisesDrugId",
        d."isDemo",
        d."createdAt",
        d."updatedAt",
        reviewer.name AS "reviewerName",
        pharmacist_profile.title AS "reviewerTitle",
        pharmacist_profile."verificationStatus"::text AS "reviewerVerificationStatus"
      FROM "DrugInformation" d
      JOIN "user" reviewer ON reviewer.id = d."reviewerId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = reviewer.id
      WHERE d.id = ${id}
        AND d."reviewerId" = ${userId}
        AND d.status::text <> 'ARCHIVED'
      LIMIT 1
    `
  )[0]

  return row ? normalizeSubmission(row) : null
}
