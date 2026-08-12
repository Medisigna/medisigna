"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"

type ForumLikeTarget = {
  postId: string
  threadSlug: string
}

type ForumLikeActionResult =
  | { ok: false; error: string }
  | { ok: true; liked: boolean; likeCount: number }

async function likeCount(postId: string) {
  const rows = await db.$queryRaw<Array<{ total: number }>>`
    SELECT COUNT(*)::int AS total
    FROM "ForumPostLike"
    WHERE "postId" = ${postId}
  `

  return rows[0]?.total ?? 0
}

function revalidateForumLike(slug: string) {
  revalidatePath("/forum")
  revalidatePath(`/forum/${slug}`)
  revalidatePath("/dashboard/forum")
  revalidatePath(`/dashboard/forum/${slug}`)
  revalidatePath("/pharmacist/dashboard/forum")
  revalidatePath(`/pharmacist/dashboard/forum/${slug}`)
  revalidatePath("/admin/forum")
  revalidatePath(`/admin/forum/${slug}`)
}

export async function toggleForumPostLike(
  postId: string
): Promise<ForumLikeActionResult> {
  const user = await requireUser()
  const normalizedPostId = postId.trim()

  if (!normalizedPostId) {
    return { ok: false, error: "Konten forum tidak ditemukan." }
  }

  const target = (
    await db.$queryRaw<ForumLikeTarget[]>`
      SELECT
        p.id AS "postId",
        t.slug AS "threadSlug"
      FROM "ForumPost" p
      JOIN "ForumThread" t ON t.id = p."threadId"
      WHERE p.id = ${normalizedPostId}
        AND p.status::text = 'VISIBLE'
        AND t.status::text <> 'HIDDEN'
      LIMIT 1
    `
  )[0]

  if (!target) {
    return { ok: false, error: "Konten forum tidak ditemukan." }
  }

  const existing = (
    await db.$queryRaw<Array<{ postId: string }>>`
      SELECT "postId"
      FROM "ForumPostLike"
      WHERE "postId" = ${target.postId}
        AND "userId" = ${user.id}
      LIMIT 1
    `
  )[0]

  if (existing) {
    await db.$executeRaw`
      DELETE FROM "ForumPostLike"
      WHERE "postId" = ${target.postId}
        AND "userId" = ${user.id}
    `

    const total = await likeCount(target.postId)
    revalidateForumLike(target.threadSlug)
    return { ok: true, liked: false, likeCount: total }
  }

  await db.$executeRaw`
    INSERT INTO "ForumPostLike" ("postId", "userId", "createdAt")
    VALUES (${target.postId}, ${user.id}, NOW())
    ON CONFLICT ("postId", "userId") DO NOTHING
  `

  const total = await likeCount(target.postId)
  revalidateForumLike(target.threadSlug)
  return { ok: true, liked: true, likeCount: total }
}
