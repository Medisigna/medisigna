import { cache } from "react"
import { Prisma } from "@prisma/client"

import { db } from "@/lib/db"

export type VideoStatus = "DRAFT" | "PUBLISHED" | "REJECTED"

export type VideoListItem = {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  youtubeUrl: string
  youtubeVideoId: string
  status: VideoStatus
  adminNote: string | null
  reviewedAt: Date | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  authorName: string
  authorTitle: string | null
}

export type VideoDetail = VideoListItem & {
  metaTitle: string | null
  metaDescription: string | null
  authorId: string
}

export type VideoListResult = {
  videos: VideoListItem[]
  total: number
}

export type VideoListParams = {
  query?: string
  status?: "ALL" | VideoStatus
  category?: string
  authorId?: string
  publishedOnly?: boolean
  limit?: number
}

const DEFAULT_VIDEO_LIMIT = 24
const YOUTUBE_VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/

export const videoStatusLabels = {
  DRAFT: "Menunggu",
  PUBLISHED: "Terbit",
  REJECTED: "Ditolak",
} satisfies Record<VideoStatus, string>

export function videoSlug(title: string) {
  return (
    title
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "video"
  )
}

export async function uniqueVideoSlug(title: string, currentId?: string) {
  const base = videoSlug(title)

  for (let suffix = 1; ; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`
    const rows = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "EducationalVideo"
      WHERE slug = ${slug}
        ${currentId ? Prisma.sql`AND id <> ${currentId}` : Prisma.empty}
      LIMIT 1
    `

    if (!rows.length) return slug
  }
}

export function youtubeThumbnailUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export function youtubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}`
}

export function extractYouTubeVideoId(rawUrl: string) {
  try {
    const url = new URL(rawUrl)
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "")
    let videoId = ""

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? ""
    } else if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") ?? ""
      } else {
        const [kind, id] = url.pathname.split("/").filter(Boolean)
        if (["embed", "shorts", "live"].includes(kind)) videoId = id ?? ""
      }
    }

    return YOUTUBE_VIDEO_ID_RE.test(videoId) ? videoId : null
  } catch {
    return null
  }
}

function videoWhere({
  authorId,
  category,
  publishedOnly,
  query,
  status = "ALL",
}: VideoListParams) {
  const likeQuery = `%${query?.trim() ?? ""}%`
  return Prisma.sql`
    WHERE 1 = 1
      ${authorId ? Prisma.sql`AND v."authorId" = ${authorId}` : Prisma.empty}
      ${category ? Prisma.sql`AND v.category = ${category}` : Prisma.empty}
      ${status !== "ALL" ? Prisma.sql`AND v.status::text = ${status}` : Prisma.empty}
      ${
        publishedOnly
          ? Prisma.sql`
            AND v.status::text = 'PUBLISHED'
            AND pharmacist_profile."verificationStatus"::text = 'VERIFIED'
          `
          : Prisma.empty
      }
      ${
        query
          ? Prisma.sql`
            AND (
              v.title ILIKE ${likeQuery}
              OR v.category ILIKE ${likeQuery}
              OR v.excerpt ILIKE ${likeQuery}
            )
          `
          : Prisma.empty
      }
  `
}

export async function getVideos(params: VideoListParams = {}): Promise<VideoListResult> {
  const limit = Math.min(Math.max(Math.trunc(params.limit ?? DEFAULT_VIDEO_LIMIT), 1), 50)
  const where = videoWhere(params)
  const [videos, totalRows] = await Promise.all([
    db.$queryRaw<VideoListItem[]>`
      SELECT
        v.id,
        v.title,
        v.slug,
        v.category,
        v.excerpt,
        v."youtubeUrl",
        v."youtubeVideoId",
        v.status::text AS status,
        v."adminNote",
        v."reviewedAt",
        v."publishedAt",
        v."createdAt",
        v."updatedAt",
        author.name AS "authorName",
        pharmacist_profile.title AS "authorTitle"
      FROM "EducationalVideo" v
      JOIN "user" author ON author.id = v."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      ${where}
      ORDER BY COALESCE(v."publishedAt", v."updatedAt") DESC
      LIMIT ${limit}
    `,
    db.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*)::int AS total
      FROM "EducationalVideo" v
      JOIN "user" author ON author.id = v."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      ${where}
    `,
  ])

  return { videos, total: totalRows[0]?.total ?? 0 }
}

export async function getVideoById(id: string) {
  const rows = await db.$queryRaw<VideoDetail[]>`
    SELECT
      v.id,
      v.title,
      v.slug,
      v.category,
      v.excerpt,
      v."youtubeUrl",
      v."youtubeVideoId",
      v."metaTitle",
      v."metaDescription",
      v.status::text AS status,
      v."adminNote",
      v."authorId",
      v."reviewedAt",
      v."publishedAt",
      v."createdAt",
      v."updatedAt",
      author.name AS "authorName",
      pharmacist_profile.title AS "authorTitle"
    FROM "EducationalVideo" v
    JOIN "user" author ON author.id = v."authorId"
    LEFT JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = author.id
    WHERE v.id = ${id}
    LIMIT 1
  `

  return rows[0] ?? null
}

export async function getVideoCategories({ publishedOnly = false }: { publishedOnly?: boolean } = {}) {
  const rows = await db.$queryRaw<Array<{ category: string }>>`
    SELECT DISTINCT v.category
    FROM "EducationalVideo" v
    JOIN "user" author ON author.id = v."authorId"
    LEFT JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = author.id
    WHERE v.category <> ''
      ${
        publishedOnly
          ? Prisma.sql`
            AND v.status::text = 'PUBLISHED'
            AND pharmacist_profile."verificationStatus"::text = 'VERIFIED'
          `
          : Prisma.empty
      }
    ORDER BY v.category ASC
  `

  return rows.map((row: { category: string }) => row.category)
}

export const getPublishedVideoBySlug = cache(async (slug: string) => {
  const rows = await db.$queryRaw<VideoDetail[]>`
    SELECT
      v.id,
      v.title,
      v.slug,
      v.category,
      v.excerpt,
      v."youtubeUrl",
      v."youtubeVideoId",
      v."metaTitle",
      v."metaDescription",
      v.status::text AS status,
      v."adminNote",
      v."authorId",
      v."reviewedAt",
      v."publishedAt",
      v."createdAt",
      v."updatedAt",
      author.name AS "authorName",
      pharmacist_profile.title AS "authorTitle"
    FROM "EducationalVideo" v
    JOIN "user" author ON author.id = v."authorId"
    LEFT JOIN "PharmacistProfile" pharmacist_profile
      ON pharmacist_profile."userId" = author.id
    WHERE v.slug = ${slug}
      AND v.status::text = 'PUBLISHED'
      AND pharmacist_profile."verificationStatus"::text = 'VERIFIED'
    LIMIT 1
  `

  return rows[0] ?? null
})
