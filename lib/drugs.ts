import { cache } from "react"
import { Prisma } from "@prisma/client"

import { db } from "@/lib/db"

export type DrugStatus = "DRAFT" | "PUBLISHED" | "REJECTED"

export type DrugListItem = {
  id: string
  slug: string
  genericName: string
  brandNames: string[]
  aliases: string[]
  uses: string
}

export type PharmacistDrugListItem = DrugListItem & {
  drugClass: string | null
  dosageForm: string | null
  reviewedAt: Date
  isDemo: boolean
}

export type AdminDrugListItem = PharmacistDrugListItem & {
  status: DrugStatus
  adminNote: string | null
  reviewDueAt: Date | null
  updatedAt: Date
  reviewer: {
    name: string
  }
}

export type DrugListResult<TDrug extends DrugListItem = DrugListItem> = {
  drugs: TDrug[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type PublicDrugDetailData = {
  slug: string
  genericName: string
  brandNames: string[]
  aliases: string[]
  uses: string
  generalUsage: string
  foodGuidance: string | null
  commonSideEffects: string[]
  warnings: string[]
  seekHelpWhen: string[]
  reviewedAt: Date
  isDemo: boolean
  reviewer: {
    name: string
    pharmacistProfile: {
      title: string
      verificationStatus: string
    } | null
  }
}

export type DrugDetailData = PublicDrugDetailData

export type PharmacistDrugDetailData = PublicDrugDetailData & {
  id: string
  drugClass: string | null
  dosageForm: string | null
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
  reviewDueAt: Date | null
}

export type AdminDrugDetailData = PharmacistDrugDetailData & {
  status: DrugStatus
  adminNote: string | null
  reviewerId: string
  createdAt: Date
  updatedAt: Date
}

type DrugListParams = {
  query?: string
  letter?: string
  page?: number
  pageSize?: number
}

type AdminDrugListParams = DrugListParams & {
  status?: "ALL" | DrugStatus
  demo?: "ALL" | "DEMO" | "PRODUCTION"
}

const DEFAULT_DRUG_PAGE_SIZE = 12
const MAX_DRUG_PAGE_SIZE = 50

const publicDrugListSelect = {
  id: true,
  slug: true,
  genericName: true,
  brandNames: true,
  aliases: true,
  uses: true,
}

const pharmacistDrugListSelect = {
  ...publicDrugListSelect,
  drugClass: true,
  dosageForm: true,
  reviewedAt: true,
  isDemo: true,
}

const adminDrugListSelect = {
  ...pharmacistDrugListSelect,
  status: true,
  adminNote: true,
  reviewDueAt: true,
  updatedAt: true,
  reviewer: {
    select: {
      name: true,
    },
  },
}

const publicDrugDetailSelect = {
  slug: true,
  genericName: true,
  brandNames: true,
  aliases: true,
  uses: true,
  generalUsage: true,
  foodGuidance: true,
  commonSideEffects: true,
  warnings: true,
  seekHelpWhen: true,
  reviewedAt: true,
  isDemo: true,
  reviewer: {
    select: {
      name: true,
      pharmacistProfile: {
        select: {
          title: true,
          verificationStatus: true,
        },
      },
    },
  },
}

const pharmacistDrugDetailSelect = {
  id: true,
  ...publicDrugDetailSelect,
  drugClass: true,
  dosageForm: true,
  pharmacistIndications: true,
  counselingPoints: true,
  screeningQuestions: true,
  contraindications: true,
  majorInteractions: true,
  seriousSideEffects: true,
  monitoringParameters: true,
  referralCriteria: true,
  internalNotes: true,
  references: true,
  reviewDueAt: true,
}

const adminDrugDetailSelect = {
  ...pharmacistDrugDetailSelect,
  status: true,
  adminNote: true,
  reviewerId: true,
  createdAt: true,
  updatedAt: true,
}

function normalizeTextList(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : []
}

function normalizeListItem<TDrug extends DrugListItem>(drug: TDrug): TDrug {
  return {
    ...drug,
    brandNames: normalizeTextList(drug.brandNames),
    aliases: normalizeTextList(drug.aliases),
  }
}

function normalizePublicDetail<TDrug extends PublicDrugDetailData | null>(
  drug: TDrug
): TDrug {
  if (!drug) return drug

  return {
    ...drug,
    brandNames: normalizeTextList(drug.brandNames),
    aliases: normalizeTextList(drug.aliases),
    commonSideEffects: normalizeTextList(drug.commonSideEffects),
    warnings: normalizeTextList(drug.warnings),
    seekHelpWhen: normalizeTextList(drug.seekHelpWhen),
  }
}

function normalizePharmacistDetail<TDrug extends PharmacistDrugDetailData | null>(
  drug: TDrug
): TDrug {
  if (!drug) return drug

  return {
    ...normalizePublicDetail(drug),
    counselingPoints: normalizeTextList(drug.counselingPoints),
    screeningQuestions: normalizeTextList(drug.screeningQuestions),
    contraindications: normalizeTextList(drug.contraindications),
    majorInteractions: normalizeTextList(drug.majorInteractions),
    seriousSideEffects: normalizeTextList(drug.seriousSideEffects),
    monitoringParameters: normalizeTextList(drug.monitoringParameters),
    referralCriteria: normalizeTextList(drug.referralCriteria),
    references: normalizeTextList(drug.references),
  }
}

function normalizePagination({
  page = 1,
  pageSize = DEFAULT_DRUG_PAGE_SIZE,
  total,
}: {
  page?: number
  pageSize?: number
  total: number
}) {
  const safePageSize = Math.min(
    Math.max(Math.trunc(pageSize) || DEFAULT_DRUG_PAGE_SIZE, 1),
    MAX_DRUG_PAGE_SIZE
  )
  const totalPages = Math.max(Math.ceil(total / safePageSize), 1)
  const safePage = Math.min(Math.max(Math.trunc(page) || 1, 1), totalPages)

  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  }
}

function getPublishedDrugWhere() {
  return {
    status: "PUBLISHED",
    reviewer: {
      pharmacistProfile: {
        is: {
          verificationStatus: "VERIFIED",
        },
      },
    },
  } as const
}

function getAdminDrugWhere(status: "ALL" | DrugStatus = "ALL") {
  return status === "ALL" ? {} : { status }
}

async function countDrugSearch({
  query,
  letter,
  status,
  demo,
  verifiedOnly,
}: {
  query: string
  letter?: string
  status?: DrugStatus
  demo?: "DEMO" | "PRODUCTION"
  verifiedOnly: boolean
}) {
  const likeQuery = `%${query.trim()}%`
  const letterCondition = letter
    ? Prisma.sql`AND d."genericName" ILIKE ${`${letter}%`}`
    : Prisma.empty
  const statusFilter = status ? [status] : ["DRAFT", "PUBLISHED", "REJECTED"]
  const verifiedStatuses = verifiedOnly ? ["VERIFIED"] : ["VERIFIED", "PENDING", "REJECTED", "NEEDS_REVISION"]
  const demoCondition =
    demo === "DEMO"
      ? Prisma.sql`AND d."isDemo" = true`
      : demo === "PRODUCTION"
        ? Prisma.sql`AND d."isDemo" = false`
        : Prisma.empty

  const result = (await db.$queryRaw`
    SELECT COUNT(*)::int AS total
    FROM "DrugInformation" d
    JOIN "user" reviewer ON reviewer."id" = d."reviewerId"
    JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = reviewer."id"
    WHERE d."status"::text = ANY(${statusFilter})
      AND pharmacist_profile."verificationStatus"::text = ANY(${verifiedStatuses})
      ${demoCondition}
      ${letterCondition}
      AND (
        d."genericName" ILIKE ${likeQuery}
        OR EXISTS (
          SELECT 1
          FROM unnest(d."brandNames") AS brand_name(name)
          WHERE brand_name.name ILIKE ${likeQuery}
        )
        OR EXISTS (
          SELECT 1
          FROM unnest(d."aliases") AS alias_name(name)
          WHERE alias_name.name ILIKE ${likeQuery}
        )
      )
  `) as Array<{ total: number }>

  return result[0]?.total ?? 0
}

async function searchDrugPageIds({
  query,
  letter,
  take,
  skip,
  status,
  demo,
  verifiedOnly,
}: {
  query: string
  letter?: string
  take: number
  skip: number
  status?: DrugStatus
  demo?: "DEMO" | "PRODUCTION"
  verifiedOnly: boolean
}) {
  const likeQuery = `%${query.trim()}%`
  const letterCondition = letter
    ? Prisma.sql`AND d."genericName" ILIKE ${`${letter}%`}`
    : Prisma.empty
  const statusFilter = status ? [status] : ["DRAFT", "PUBLISHED", "REJECTED"]
  const verifiedStatuses = verifiedOnly ? ["VERIFIED"] : ["VERIFIED", "PENDING", "REJECTED", "NEEDS_REVISION"]
  const demoCondition =
    demo === "DEMO"
      ? Prisma.sql`AND d."isDemo" = true`
      : demo === "PRODUCTION"
        ? Prisma.sql`AND d."isDemo" = false`
        : Prisma.empty

  return (await db.$queryRaw`
    SELECT d."id"
    FROM "DrugInformation" d
    JOIN "user" reviewer ON reviewer."id" = d."reviewerId"
    JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = reviewer."id"
    WHERE d."status"::text = ANY(${statusFilter})
      AND pharmacist_profile."verificationStatus"::text = ANY(${verifiedStatuses})
      ${demoCondition}
      ${letterCondition}
      AND (
        d."genericName" ILIKE ${likeQuery}
        OR EXISTS (
          SELECT 1
          FROM unnest(d."brandNames") AS brand_name(name)
          WHERE brand_name.name ILIKE ${likeQuery}
        )
        OR EXISTS (
          SELECT 1
          FROM unnest(d."aliases") AS alias_name(name)
          WHERE alias_name.name ILIKE ${likeQuery}
        )
      )
    ORDER BY d."genericName" ASC
    LIMIT ${take}
    OFFSET ${skip}
  `) as Array<{ id: string }>
}

async function getDrugList<TDrug extends DrugListItem>({
  query = "",
  letter = "",
  page = 1,
  pageSize = DEFAULT_DRUG_PAGE_SIZE,
  where,
  select,
  searchStatus,
  searchDemo,
  verifiedOnly,
}: DrugListParams & {
  where: object
  select: object
  searchStatus?: DrugStatus
  searchDemo?: "DEMO" | "PRODUCTION"
  verifiedOnly: boolean
}): Promise<DrugListResult<TDrug>> {
  const normalizedQuery = query.trim()
  const normalizedLetter = /^[A-Z]$/.test(letter.toUpperCase()) ? letter.toUpperCase() : ""
  const listWhere = {
    ...where,
    ...(normalizedLetter
      ? {
          genericName: {
            startsWith: normalizedLetter,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {}),
  }
  const total = normalizedQuery
    ? await countDrugSearch({
        query: normalizedQuery,
        letter: normalizedLetter,
        status: searchStatus,
        demo: searchDemo,
        verifiedOnly,
      })
    : await db.drugInformation.count({ where: listWhere })
  const pagination = normalizePagination({ page, pageSize, total })
  const skip = (pagination.page - 1) * pagination.pageSize
  const matchedIds = normalizedQuery
    ? (
        await searchDrugPageIds({
          query: normalizedQuery,
          letter: normalizedLetter,
          take: pagination.pageSize,
          skip,
          status: searchStatus,
          demo: searchDemo,
          verifiedOnly,
        })
      ).map((drug) => drug.id)
    : null

  if (matchedIds && !matchedIds.length) {
    return { drugs: [], ...pagination }
  }

  const drugs = (
    (await db.drugInformation.findMany({
      where: {
        ...listWhere,
        ...(matchedIds ? { id: { in: matchedIds } } : {}),
      },
      select,
      orderBy: { genericName: "asc" },
      skip: matchedIds ? undefined : skip,
      take: pagination.pageSize,
    })) as TDrug[]
  ).map(normalizeListItem)

  return { drugs, ...pagination }
}

export const getPublishedDrugs = cache(
  (params: DrugListParams = {}) =>
    getDrugList<DrugListItem>({
      ...params,
      where: getPublishedDrugWhere(),
      select: publicDrugListSelect,
      searchStatus: "PUBLISHED",
      verifiedOnly: true,
    })
)

export const getPharmacistDrugs = cache(
  (params: DrugListParams = {}) =>
    getDrugList<PharmacistDrugListItem>({
      ...params,
      where: getPublishedDrugWhere(),
      select: pharmacistDrugListSelect,
      searchStatus: "PUBLISHED",
      verifiedOnly: true,
    })
)

export const getAdminDrugs = cache(
  ({ status = "ALL", demo = "ALL", ...params }: AdminDrugListParams = {}) =>
    getDrugList<AdminDrugListItem>({
      ...params,
      where: {
        ...getAdminDrugWhere(status),
        ...(demo === "ALL" ? {} : { isDemo: demo === "DEMO" }),
      },
      select: adminDrugListSelect,
      searchStatus: status === "ALL" ? undefined : status,
      searchDemo: demo === "ALL" ? undefined : demo,
      verifiedOnly: false,
    })
)

export const getPublishedDrug = cache(async (slug: string) =>
  normalizePublicDetail(
    (await db.drugInformation.findFirst({
      where: {
        slug,
        ...getPublishedDrugWhere(),
      },
      select: publicDrugDetailSelect,
    })) as PublicDrugDetailData | null
  )
)

export const getPharmacistDrug = cache(async (slug: string) =>
  normalizePharmacistDetail(
    (await db.drugInformation.findFirst({
      where: {
        slug,
        ...getPublishedDrugWhere(),
      },
      select: pharmacistDrugDetailSelect,
    })) as PharmacistDrugDetailData | null
  )
)

export const getAdminDrug = cache(async (id: string) =>
  normalizePharmacistDetail(
    (await db.drugInformation.findUnique({
      where: { id },
      select: adminDrugDetailSelect,
    })) as AdminDrugDetailData | null
  )
)
