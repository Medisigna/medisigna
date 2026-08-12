"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"

import { value } from "@/app/actions/shared"
import { canWriteForum, uniqueForumThreadSlug } from "@/lib/forum"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"

function forumBasePath(role: string) {
  return role === "PHARMACIST" ? "/pharmacist/dashboard/forum" : "/dashboard/forum"
}

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
      altText: textField(item.altText, "Gambar diskusi", 160),
      fileName: textField(item.fileName, "gambar", 180),
      fileUrl: String(item.fileUrl).trim(),
      isInline: false,
    }))
}

export async function createForumThread(formData: FormData) {
  const user = await requireUser()
  const basePath = forumBasePath(user.role)

  if (!canWriteForum(user)) {
    return { ok: false, error: "Akun belum memiliki akses menulis forum." }
  }

  const title = value(formData, "title")
  const categoryId = value(formData, "categoryId")
  const bodyMarkdown = value(formData, "bodyMarkdown")
  const attachments = parseForumAttachments(formData)

  if (!title) return { ok: false, error: "Judul wajib diisi." }
  if (title.length > 140) return { ok: false, error: "Judul maksimal 140 karakter." }
  if (!categoryId) return { ok: false, error: "Kategori wajib dipilih." }
  if (!bodyMarkdown && !attachments.length) {
    return { ok: false, error: "Isi diskusi atau gambar wajib diisi." }
  }

  const category = (
    await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "ForumCategory"
      WHERE id = ${categoryId}
        AND "isActive" = true
      LIMIT 1
    `
  )[0]

  if (!category) return { ok: false, error: "Kategori tidak valid." }

  const threadId = randomUUID()
  const postId = randomUUID()
  const slug = await uniqueForumThreadSlug(title)

  await db.$transaction(async (tx: any) => {
    await tx.$executeRaw`
      INSERT INTO "ForumThread" (
        id,
        title,
        slug,
        "categoryId",
        "authorId",
        status,
        "isPinned",
        "lastPostAt",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${threadId},
        ${title},
        ${slug},
        ${categoryId},
        ${user.id},
        'ACTIVE'::"ForumThreadStatus",
        false,
        NOW(),
        NOW(),
        NOW()
      )
    `

    await tx.$executeRaw`
      INSERT INTO "ForumPost" (
        id,
        "threadId",
        "authorId",
        "bodyMarkdown",
        status,
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${postId},
        ${threadId},
        ${user.id},
        ${bodyMarkdown},
        'VISIBLE'::"ForumPostStatus",
        NOW(),
        NOW()
      )
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
  revalidatePath("/pharmacist/dashboard/forum")
  revalidatePath("/admin/forum")

  return { ok: true, slug, href: `${basePath}/${slug}` }
}
