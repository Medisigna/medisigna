import { cache } from "react"
import { randomUUID } from "node:crypto"
import { Prisma } from "@prisma/client"

import { db } from "@/lib/db"
import { forumSlug } from "@/lib/forum-utils"

export { canWriteForum, forumAuthorName, forumSlug } from "@/lib/forum-utils"

export type ForumThreadStatus = "ACTIVE" | "LOCKED" | "HIDDEN"
export type ForumPostStatus = "VISIBLE" | "HIDDEN"
export type ForumReportStatus = "OPEN" | "RESOLVED" | "DISMISSED"
export type ForumReportTargetType = "THREAD" | "POST"

export type ForumCategoryItem = {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  threadCount: number
  createdAt: Date
  updatedAt: Date
}

export type ForumThreadListItem = {
  id: string
  title: string
  slug: string
  firstPostId: string | null
  bodyMarkdown: string | null
  status: ForumThreadStatus
  isPinned: boolean
  hiddenReason: string | null
  lastPostAt: Date
  createdAt: Date
  updatedAt: Date
  categoryName: string
  categorySlug: string
  authorId: string
  authorName: string
  authorImage: string | null
  authorRole: "PATIENT" | "PHARMACIST" | "ADMIN"
  authorTitle: string | null
  postCount: number
  likeCount: number
  isLiked: boolean
  unreadCount: number
  reportCount: number
  attachments: ForumPostAttachmentItem[]
}

type ForumThreadListRow = Omit<ForumThreadListItem, "attachments">

export type ForumPostItem = {
  id: string
  threadId: string
  parentPostId: string | null
  authorId: string
  authorName: string
  authorImage: string | null
  authorRole: "PATIENT" | "PHARMACIST" | "ADMIN"
  authorTitle: string | null
  bodyMarkdown: string
  status: ForumPostStatus
  hiddenReason: string | null
  createdAt: Date
  updatedAt: Date
  likeCount: number
  isLiked: boolean
  attachments: ForumPostAttachmentItem[]
}

export type ForumPostAttachmentItem = {
  id: string
  postId: string
  fileUrl: string
  fileName: string
  altText: string | null
  isInline: boolean
  sortOrder: number
  createdAt: Date
}

export type ForumThreadDetail = ForumThreadListItem & {
  lockedAt: Date | null
  hiddenAt: Date | null
  posts: ForumPostItem[]
}

export type ForumReportItem = {
  id: string
  targetType: ForumReportTargetType
  threadId: string | null
  threadTitle: string | null
  threadSlug: string | null
  postId: string | null
  postExcerpt: string | null
  reporterName: string
  reason: string
  status: ForumReportStatus
  resolutionNote: string | null
  createdAt: Date
  updatedAt: Date
}

export type ForumThreadListResult = {
  threads: ForumThreadListItem[]
  total: number
}

export const forumThreadStatusLabels = {
  ACTIVE: "Aktif",
  LOCKED: "Dikunci",
  HIDDEN: "Disembunyikan",
} satisfies Record<ForumThreadStatus, string>

export const forumReportStatusLabels = {
  OPEN: "Terbuka",
  RESOLVED: "Selesai",
  DISMISSED: "Ditolak",
} satisfies Record<ForumReportStatus, string>

export async function uniqueForumThreadSlug(title: string, currentId?: string) {
  const base = forumSlug(title)

  for (let suffix = 1; ; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`
    const rows = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "ForumThread"
      WHERE slug = ${slug}
        ${currentId ? Prisma.sql`AND id <> ${currentId}` : Prisma.empty}
      LIMIT 1
    `

    if (!rows.length) return slug
  }
}

export async function getForumCategories({
  activeOnly = true,
}: {
  activeOnly?: boolean
} = {}): Promise<ForumCategoryItem[]> {
  return db.$queryRaw<ForumCategoryItem[]>`
    SELECT
      c.id,
      c.name,
      c.slug,
      c.description,
      c."isActive",
      c."createdAt",
      c."updatedAt",
      COUNT(t.id)::int AS "threadCount"
    FROM "ForumCategory" c
    LEFT JOIN "ForumThread" t
      ON t."categoryId" = c.id
      AND t.status::text <> 'HIDDEN'
    WHERE 1 = 1
      ${activeOnly ? Prisma.sql`AND c."isActive" = true` : Prisma.empty}
    GROUP BY c.id
    ORDER BY c.name ASC
  `
}

export async function getForumThreads({
  category,
  includeHidden = false,
  limit = 30,
  query,
  userId,
}: {
  category?: string
  includeHidden?: boolean
  limit?: number
  query?: string
  userId?: string
} = {}): Promise<ForumThreadListResult> {
  const normalizedLimit = Math.min(Math.max(Math.trunc(limit), 1), 50)
  const likeQuery = `%${query?.trim() ?? ""}%`
  const where = Prisma.sql`
    WHERE 1 = 1
      ${includeHidden ? Prisma.empty : Prisma.sql`AND t.status::text <> 'HIDDEN'`}
      ${category ? Prisma.sql`AND c.slug = ${category}` : Prisma.empty}
      ${
        query
          ? Prisma.sql`
            AND (
              t.title ILIKE ${likeQuery}
              OR c.name ILIKE ${likeQuery}
              OR EXISTS (
                SELECT 1
                FROM "ForumPost" search_post
                WHERE search_post."threadId" = t.id
                  AND search_post.status::text = 'VISIBLE'
                  AND search_post."bodyMarkdown" ILIKE ${likeQuery}
              )
            )
          `
          : Prisma.empty
      }
  `
  const unreadSql = userId
    ? Prisma.sql`
      (
        SELECT COUNT(*)::int
        FROM "ForumPost" unread_post
        LEFT JOIN "ForumSubscription" s
          ON s."threadId" = t.id
          AND s."userId" = ${userId}
        WHERE unread_post."threadId" = t.id
          AND unread_post.status::text = 'VISIBLE'
          AND unread_post."authorId" <> ${userId}
          AND unread_post."createdAt" > COALESCE(s."lastReadAt", '-infinity'::timestamp)
      ) AS "unreadCount"
    `
    : Prisma.sql`0::int AS "unreadCount"`
  const likedSql = userId
    ? Prisma.sql`
      EXISTS (
        SELECT 1
        FROM "ForumPostLike" current_like
        WHERE current_like."postId" = first_post.id
          AND current_like."userId" = ${userId}
      ) AS "isLiked"
    `
    : Prisma.sql`false AS "isLiked"`

  const [threadRows, totalRows]: [ForumThreadListRow[], Array<{ total: number }>] =
    await Promise.all([
    db.$queryRaw<ForumThreadListRow[]>`
      SELECT
        t.id,
        t.title,
        t.slug,
        first_post.id AS "firstPostId",
        first_post."bodyMarkdown" AS "bodyMarkdown",
        t.status::text AS status,
        t."isPinned",
        t."hiddenReason",
        t."lastPostAt",
        t."createdAt",
        t."updatedAt",
        c.name AS "categoryName",
        c.slug AS "categorySlug",
        author.id AS "authorId",
        author.name AS "authorName",
        author.image AS "authorImage",
        author.role::text AS "authorRole",
        pharmacist_profile.title AS "authorTitle",
        (
          SELECT COUNT(*)::int
          FROM "ForumPost" p
          WHERE p."threadId" = t.id
            ${includeHidden ? Prisma.empty : Prisma.sql`AND p.status::text = 'VISIBLE'`}
        ) AS "postCount",
        (
          SELECT COUNT(*)::int
          FROM "ForumPostLike" post_like
          WHERE post_like."postId" = first_post.id
        ) AS "likeCount",
        ${likedSql},
        ${unreadSql},
        (
          SELECT COUNT(*)::int
          FROM "ForumReport" r
          WHERE r."threadId" = t.id
            AND r.status::text = 'OPEN'
        ) AS "reportCount"
      FROM "ForumThread" t
      JOIN "ForumCategory" c ON c.id = t."categoryId"
      JOIN "user" author ON author.id = t."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      LEFT JOIN LATERAL (
        SELECT first_post.id, first_post."bodyMarkdown"
        FROM "ForumPost" first_post
        WHERE first_post."threadId" = t.id
          ${includeHidden ? Prisma.empty : Prisma.sql`AND first_post.status::text = 'VISIBLE'`}
        ORDER BY first_post."createdAt" ASC
        LIMIT 1
      ) first_post ON true
      ${where}
      ORDER BY t."isPinned" DESC, t."lastPostAt" DESC
      LIMIT ${normalizedLimit}
    `,
    db.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*)::int AS total
      FROM "ForumThread" t
      JOIN "ForumCategory" c ON c.id = t."categoryId"
      ${where}
    `,
    ])
  const threads = threadRows
  const threadIds = threads.map((thread) => thread.id)

  const attachmentRows = threads.length
    ? await db.$queryRaw<Array<ForumPostAttachmentItem & { threadId: string }>>`
        SELECT
          a.id,
          a."postId",
          p."threadId",
          a."fileUrl",
          a."fileName",
          a."altText",
          a."isInline",
          a."sortOrder",
          a."createdAt"
        FROM "ForumPostAttachment" a
        JOIN "ForumPost" p ON p.id = a."postId"
        JOIN (
          SELECT DISTINCT ON (first_post."threadId")
            first_post.id,
            first_post."threadId"
          FROM "ForumPost" first_post
          WHERE first_post."threadId" IN (${Prisma.join(threadIds)})
            ${includeHidden ? Prisma.empty : Prisma.sql`AND first_post.status::text = 'VISIBLE'`}
          ORDER BY first_post."threadId", first_post."createdAt" ASC
        ) first_visible_post ON first_visible_post.id = a."postId"
        WHERE a."isInline" = false
        ORDER BY p."threadId", a."sortOrder" ASC, a."createdAt" ASC
      `
    : []
  const attachmentsByThreadId = new Map<string, ForumPostAttachmentItem[]>()
  for (const attachment of attachmentRows) {
    const current = attachmentsByThreadId.get(attachment.threadId) ?? []
    current.push(attachment)
    attachmentsByThreadId.set(attachment.threadId, current)
  }
  const threadsWithAttachments: ForumThreadListItem[] = threads.map((thread) => ({
    ...thread,
    attachments: attachmentsByThreadId.get(thread.id) ?? [],
  }))

  return { threads: threadsWithAttachments, total: totalRows[0]?.total ?? 0 }
}

export const getForumThreadBySlug = cache(
  async ({
    includeHidden = false,
    slug,
    userId,
  }: {
    includeHidden?: boolean
    slug: string
    userId?: string
  }): Promise<ForumThreadDetail | null> => {
    const baseThread = (
      await db.$queryRaw<ForumThreadListRow[]>`
        SELECT
          t.id,
          t.title,
          t.slug,
          first_post.id AS "firstPostId",
          first_post."bodyMarkdown" AS "bodyMarkdown",
          t.status::text AS status,
          t."isPinned",
          t."hiddenReason",
          t."lastPostAt",
          t."createdAt",
          t."updatedAt",
          c.name AS "categoryName",
          c.slug AS "categorySlug",
          author.id AS "authorId",
          author.name AS "authorName",
          author.image AS "authorImage",
          author.role::text AS "authorRole",
          pharmacist_profile.title AS "authorTitle",
          (
            SELECT COUNT(*)::int
            FROM "ForumPost" p
            WHERE p."threadId" = t.id
              ${includeHidden ? Prisma.empty : Prisma.sql`AND p.status::text = 'VISIBLE'`}
          ) AS "postCount",
          (
            SELECT COUNT(*)::int
            FROM "ForumPostLike" post_like
            WHERE post_like."postId" = first_post.id
          ) AS "likeCount",
          ${
            userId
              ? Prisma.sql`
                EXISTS (
                  SELECT 1
                  FROM "ForumPostLike" current_like
                  WHERE current_like."postId" = first_post.id
                    AND current_like."userId" = ${userId}
                ) AS "isLiked"
              `
              : Prisma.sql`false AS "isLiked"`
          },
          ${
            userId
              ? Prisma.sql`
                (
                  SELECT COUNT(*)::int
                  FROM "ForumPost" unread_post
                  LEFT JOIN "ForumSubscription" s
                    ON s."threadId" = t.id
                    AND s."userId" = ${userId}
                  WHERE unread_post."threadId" = t.id
                    AND unread_post.status::text = 'VISIBLE'
                    AND unread_post."authorId" <> ${userId}
                    AND unread_post."createdAt" > COALESCE(s."lastReadAt", '-infinity'::timestamp)
                ) AS "unreadCount"
              `
              : Prisma.sql`0::int AS "unreadCount"`
          },
          (
            SELECT COUNT(*)::int
            FROM "ForumReport" r
            WHERE r."threadId" = t.id
              AND r.status::text = 'OPEN'
          ) AS "reportCount"
        FROM "ForumThread" t
        JOIN "ForumCategory" c ON c.id = t."categoryId"
        JOIN "user" author ON author.id = t."authorId"
        LEFT JOIN "PharmacistProfile" pharmacist_profile
          ON pharmacist_profile."userId" = author.id
        LEFT JOIN LATERAL (
          SELECT first_post.id, first_post."bodyMarkdown"
          FROM "ForumPost" first_post
          WHERE first_post."threadId" = t.id
            ${includeHidden ? Prisma.empty : Prisma.sql`AND first_post.status::text = 'VISIBLE'`}
          ORDER BY first_post."createdAt" ASC
          LIMIT 1
        ) first_post ON true
        WHERE t.slug = ${slug}
          ${includeHidden ? Prisma.empty : Prisma.sql`AND t.status::text <> 'HIDDEN'`}
        LIMIT 1
      `
    )[0]

    if (!baseThread) return null

    const rows = await db.$queryRaw<Array<{ lockedAt: Date | null; hiddenAt: Date | null }>>`
      SELECT t."lockedAt", t."hiddenAt"
      FROM "ForumThread" t
      WHERE t.id = ${baseThread.id}
      LIMIT 1
    `
    const meta = rows[0] ?? { lockedAt: null, hiddenAt: null }
    const posts = (await db.$queryRaw`
      SELECT
        p.id,
        p."threadId",
        p."parentPostId",
        p."authorId",
        author.name AS "authorName",
        author.image AS "authorImage",
        author.role::text AS "authorRole",
        pharmacist_profile.title AS "authorTitle",
        p."bodyMarkdown",
        p.status::text AS status,
        p."hiddenReason",
        p."createdAt",
        p."updatedAt",
        (
          SELECT COUNT(*)::int
          FROM "ForumPostLike" post_like
          WHERE post_like."postId" = p.id
        ) AS "likeCount",
        ${
          userId
            ? Prisma.sql`
              EXISTS (
                SELECT 1
                FROM "ForumPostLike" current_like
                WHERE current_like."postId" = p.id
                  AND current_like."userId" = ${userId}
              ) AS "isLiked"
            `
            : Prisma.sql`false AS "isLiked"`
        }
      FROM "ForumPost" p
      JOIN "user" author ON author.id = p."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      WHERE p."threadId" = ${baseThread.id}
        ${includeHidden ? Prisma.empty : Prisma.sql`AND p.status::text = 'VISIBLE'`}
      ORDER BY p."createdAt" ASC
    `) as Array<Omit<ForumPostItem, "attachments">>

    const attachments = posts.length
      ? await db.$queryRaw<ForumPostAttachmentItem[]>`
          SELECT
            a.id,
            a."postId",
            a."fileUrl",
            a."fileName",
            a."altText",
            a."isInline",
            a."sortOrder",
            a."createdAt"
          FROM "ForumPostAttachment" a
          WHERE a."postId" IN (${Prisma.join(posts.map((post) => post.id))})
          ORDER BY a."sortOrder" ASC, a."createdAt" ASC
        `
      : []
    const attachmentsByPostId = new Map<string, ForumPostAttachmentItem[]>()
    for (const attachment of attachments) {
      const current = attachmentsByPostId.get(attachment.postId) ?? []
      current.push(attachment)
      attachmentsByPostId.set(attachment.postId, current)
    }
    const postsWithAttachments: ForumPostItem[] = posts.map((post) => ({
      ...post,
      attachments: attachmentsByPostId.get(post.id) ?? [],
    }))

    return {
      ...baseThread,
      attachments: postsWithAttachments[0]?.attachments ?? [],
      lockedAt: meta.lockedAt,
      hiddenAt: meta.hiddenAt,
      posts: postsWithAttachments,
    }
  }
)

export async function getForumUnreadCount(userId: string) {
  const rows = await db.$queryRaw<Array<{ total: number }>>`
    SELECT COUNT(*)::int AS total
    FROM "ForumPost" p
    JOIN "ForumThread" t ON t.id = p."threadId"
    JOIN "ForumSubscription" s
      ON s."threadId" = p."threadId"
      AND s."userId" = ${userId}
    WHERE p.status::text = 'VISIBLE'
      AND t.status::text <> 'HIDDEN'
      AND p."authorId" <> ${userId}
      AND p."createdAt" > s."lastReadAt"
  `

  return rows[0]?.total ?? 0
}

export async function getForumReports({
  status = "OPEN",
}: {
  status?: ForumReportStatus | "ALL"
} = {}): Promise<ForumReportItem[]> {
  return db.$queryRaw<ForumReportItem[]>`
    SELECT
      r.id,
      r."targetType"::text AS "targetType",
      r."threadId",
      thread.title AS "threadTitle",
      thread.slug AS "threadSlug",
      r."postId",
      LEFT(post."bodyMarkdown", 120) AS "postExcerpt",
      reporter.name AS "reporterName",
      r.reason,
      r.status::text AS status,
      r."resolutionNote",
      r."createdAt",
      r."updatedAt"
    FROM "ForumReport" r
    LEFT JOIN "ForumThread" thread ON thread.id = r."threadId"
    LEFT JOIN "ForumPost" post ON post.id = r."postId"
    JOIN "user" reporter ON reporter.id = r."reporterId"
    WHERE 1 = 1
      ${status !== "ALL" ? Prisma.sql`AND r.status::text = ${status}` : Prisma.empty}
    ORDER BY r."createdAt" DESC
    LIMIT 100
  `
}

export async function upsertForumSubscription(threadId: string, userId: string) {
  await db.$executeRaw`
    INSERT INTO "ForumSubscription" (id, "threadId", "userId", "lastReadAt", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${threadId}, ${userId}, NOW(), NOW(), NOW())
    ON CONFLICT ("threadId", "userId")
    DO UPDATE SET
      "lastReadAt" = EXCLUDED."lastReadAt",
      "updatedAt" = NOW()
  `
}
