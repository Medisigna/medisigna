import { cache } from "react"

import { db } from "@/lib/db"

export type DrugListItem = {
  id: string
  slug: string
  genericName: string
  brandNames: string[]
  aliases: string[]
  uses: string
}

export type DrugDetailData = {
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

export const getPublishedDrugs = cache(
  async () =>
    (await db.drugInformation.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        slug: true,
        genericName: true,
        brandNames: true,
        aliases: true,
        uses: true,
      },
      orderBy: { genericName: "asc" },
    })) as DrugListItem[]
)

export const getPublishedDrug = cache(
  async (slug: string) =>
    (await db.drugInformation.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: {
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
      },
    })) as DrugDetailData | null
)
