import { cache } from "react"
import { Prisma } from "@prisma/client"

import { db } from "@/lib/db"

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "REJECTED"

export type ArticleListItem = {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  coverImageUrl: string | null
  status: ArticleStatus
  adminNote: string | null
  reviewedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  authorName: string
  authorTitle: string | null
}

export type ArticleDetail = ArticleListItem & {
  contentMarkdown: string
  metaTitle: string | null
  metaDescription: string | null
  authorId: string
}

export type ArticleListResult = {
  articles: ArticleListItem[]
  total: number
}

export type ArticleListParams = {
  query?: string
  status?: "ALL" | ArticleStatus
  category?: string
  authorId?: string
  publishedOnly?: boolean
  limit?: number
}

const DEFAULT_ARTICLE_LIMIT = 24

export const articleStatusLabels = {
  DRAFT: "Menunggu",
  PUBLISHED: "Terbit",
  REJECTED: "Ditolak",
} satisfies Record<ArticleStatus, string>

export function articleSlug(title: string) {
  return (
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "artikel"
  )
}

export async function uniqueArticleSlug(title: string, currentId?: string) {
  const base = articleSlug(title)

  for (let suffix = 1; ; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`
    const rows = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "Article"
      WHERE slug = ${slug}
        ${currentId ? Prisma.sql`AND id <> ${currentId}` : Prisma.empty}
      LIMIT 1
    `

    if (!rows.length) return slug
  }
}

function articleWhere({
  authorId,
  category,
  publishedOnly,
  query,
  status = "ALL",
}: ArticleListParams) {
  const likeQuery = `%${query?.trim() ?? ""}%`
  return Prisma.sql`
    WHERE 1 = 1
      ${authorId ? Prisma.sql`AND a."authorId" = ${authorId}` : Prisma.empty}
      ${category ? Prisma.sql`AND a.category = ${category}` : Prisma.empty}
      ${status !== "ALL" ? Prisma.sql`AND a.status::text = ${status}` : Prisma.empty}
      ${
        publishedOnly
          ? Prisma.sql`
            AND a.status::text = 'PUBLISHED'
            AND pharmacist_profile."verificationStatus"::text = 'VERIFIED'
          `
          : Prisma.empty
      }
      ${
        query
          ? Prisma.sql`
            AND (
              a.title ILIKE ${likeQuery}
              OR a.category ILIKE ${likeQuery}
              OR a.excerpt ILIKE ${likeQuery}
            )
          `
          : Prisma.empty
      }
  `
}

export async function getArticles(params: ArticleListParams = {}): Promise<ArticleListResult> {
  const limit = Math.min(Math.max(Math.trunc(params.limit ?? DEFAULT_ARTICLE_LIMIT), 1), 50)
  const where = articleWhere(params)
  const [articles, totalRows] = await Promise.all([
    db.$queryRaw<ArticleListItem[]>`
      SELECT
        a.id,
        a.title,
        a.slug,
        a.category,
        a.excerpt,
        a."coverImageUrl",
        a.status::text AS status,
        a."adminNote",
        a."reviewedAt",
        a."publishedAt",
        a."createdAt",
        a."updatedAt",
        author.name AS "authorName",
        pharmacist_profile.title AS "authorTitle"
      FROM "Article" a
      JOIN "user" author ON author.id = a."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      ${where}
      ORDER BY COALESCE(a."publishedAt", a."updatedAt") DESC
      LIMIT ${limit}
    `,
    db.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*)::int AS total
      FROM "Article" a
      JOIN "user" author ON author.id = a."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      ${where}
    `,
  ])

  return { articles, total: totalRows[0]?.total ?? 0 }
}

export async function getArticleById(id: string) {
  const rows = await db.$queryRaw<ArticleDetail[]>`
    SELECT
      a.id,
      a.title,
      a.slug,
      a.category,
      a.excerpt,
      a."contentMarkdown",
      a."metaTitle",
      a."metaDescription",
      a."coverImageUrl",
      a.status::text AS status,
      a."adminNote",
      a."authorId",
      a."reviewedAt",
      a."publishedAt",
      a."createdAt",
      a."updatedAt",
      author.name AS "authorName",
      pharmacist_profile.title AS "authorTitle"
    FROM "Article" a
    JOIN "user" author ON author.id = a."authorId"
    LEFT JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = author.id
    WHERE a.id = ${id}
    LIMIT 1
  `

  return rows[0] ?? null
}

export async function getArticleCategories({ publishedOnly = false }: { publishedOnly?: boolean } = {}) {
  const rows = await db.$queryRaw<Array<{ category: string }>>`
    SELECT DISTINCT a.category
    FROM "Article" a
    JOIN "user" author ON author.id = a."authorId"
    LEFT JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = author.id
    WHERE a.category <> ''
      ${
        publishedOnly
          ? Prisma.sql`
            AND a.status::text = 'PUBLISHED'
            AND pharmacist_profile."verificationStatus"::text = 'VERIFIED'
          `
          : Prisma.empty
      }
    ORDER BY a.category ASC
  `

  return rows.map((row: { category: string }) => row.category)
}

export const getPublishedArticleBySlug = cache(async (slug: string) => {
  const rows = await db.$queryRaw<ArticleDetail[]>`
    SELECT
      a.id,
      a.title,
      a.slug,
      a.category,
      a.excerpt,
      a."contentMarkdown",
      a."metaTitle",
      a."metaDescription",
      a."coverImageUrl",
      a.status::text AS status,
      a."adminNote",
      a."authorId",
      a."reviewedAt",
      a."publishedAt",
      a."createdAt",
      a."updatedAt",
      author.name AS "authorName",
      pharmacist_profile.title AS "authorTitle"
    FROM "Article" a
    JOIN "user" author ON author.id = a."authorId"
    LEFT JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = author.id
    WHERE a.slug = ${slug}
      AND a.status::text = 'PUBLISHED'
      AND pharmacist_profile."verificationStatus"::text = 'VERIFIED'
    LIMIT 1
  `

  return rows[0] ?? null
})
