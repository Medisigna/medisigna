"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"

import { value } from "@/app/actions/shared"
import { canWriteForum } from "@/lib/forum"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"

type ForumAttachmentInput = {
  altText?: unknown
  fileName?: unknown
  fileUrl?: unknown
  isInline?: unknown
}

function textField(value: unknown, fallback: string, maxLength: number) {
  const text = typeof value === "string" ? value.trim() : ""
  return (text || fallback).slice(0, maxLength)
}

function parseForumAttachments(formData: FormData) {
  const raw = value(formData, "forumAttachments")
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }

  if (!Array.isArray(parsed)) return []

  return parsed
    .slice(0, 8)
    .map((item): ForumAttachmentInput | null =>
      item && typeof item === "object" ? (item as ForumAttachmentInput) : null
    )
    .filter((item): item is ForumAttachmentInput => {
      if (!item) return false
      if (typeof item.fileUrl !== "string") return false
      return /^https:\/\//i.test(item.fileUrl)
    })
    .map((item) => ({
      altText: textField(item.altText, "Gambar balasan", 160),
      fileName: textField(item.fileName, "gambar", 180),
      fileUrl: String(item.fileUrl).trim(),
      isInline: item.isInline === true,
    }))
}

export async function replyForumThread(formData: FormData) {
  const user = await requireUser()

  if (!canWriteForum(user)) {
    return { ok: false, error: "Akun belum memiliki akses membalas forum." }
  }

  const threadId = value(formData, "threadId")
  const parentPostId = value(formData, "parentPostId")
  const bodyMarkdown = value(formData, "bodyMarkdown")
  const attachments = parseForumAttachments(formData)

  if (!threadId) return { ok: false, error: "Thread tidak ditemukan." }
  if (!bodyMarkdown && !attachments.length) {
    return { ok: false, error: "Balasan atau gambar wajib diisi." }
  }

  const thread = (
    await db.$queryRaw<Array<{ id: string; slug: string; status: string }>>`
      SELECT id, slug, status::text AS status
      FROM "ForumThread"
      WHERE id = ${threadId}
      LIMIT 1
    `
  )[0]

  if (!thread || thread.status === "HIDDEN") {
    return { ok: false, error: "Thread tidak ditemukan." }
  }
  if (thread.status === "LOCKED" && user.role !== "ADMIN") {
    return { ok: false, error: "Thread sudah dikunci." }
  }

  if (parentPostId) {
    const parentPost = (
      await db.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM "ForumPost"
        WHERE id = ${parentPostId}
          AND "threadId" = ${threadId}
          AND status::text = 'VISIBLE'
        LIMIT 1
      `
    )[0]

    if (!parentPost) return { ok: false, error: "Komentar tidak ditemukan." }
  }

  const postId = randomUUID()

  await db.$transaction(async (tx: any) => {
    await tx.$executeRaw`
      INSERT INTO "ForumPost" (
        id,
        "threadId",
        "parentPostId",
        "authorId",
        "bodyMarkdown",
        status,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${postId},
        ${threadId},
        ${parentPostId || null},
        ${user.id},
        ${bodyMarkdown},
        'VISIBLE'::"ForumPostStatus",
        NOW(),
        NOW()
      )
    `

    await tx.$executeRaw`
      UPDATE "ForumThread"
      SET "lastPostAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${threadId}
    `

    await tx.$executeRaw`
      INSERT INTO "ForumSubscription" (id, "threadId", "userId", "lastReadAt", "createdAt", "updatedAt")
      VALUES (${randomUUID()}, ${threadId}, ${user.id}, NOW(), NOW(), NOW())
      ON CONFLICT ("threadId", "userId")
      DO UPDATE SET "lastReadAt" = EXCLUDED."lastReadAt", "updatedAt" = NOW()
    `

    for (const [index, attachment] of attachments.entries()) {
      await tx.$executeRaw`
        INSERT INTO "ForumPostAttachment" (
          id,
          "postId",
          "uploadedById",
          "fileUrl",
          "fileName",
          "altText",
          "isInline",
          "sortOrder",
          "createdAt"
        )
        VALUES (
          ${randomUUID()},
          ${postId},
          ${user.id},
          ${attachment.fileUrl},
          ${attachment.fileName},
          ${attachment.altText},
          ${attachment.isInline},
          ${index},
          NOW()
        )
      `
    }
  })

  revalidatePath("/dashboard/forum")
  revalidatePath(`/dashboard/forum/${thread.slug}`)
  revalidatePath("/pharmacist/dashboard/forum")
  revalidatePath(`/pharmacist/dashboard/forum/${thread.slug}`)
  revalidatePath("/admin/forum")

  return { ok: true }
}
