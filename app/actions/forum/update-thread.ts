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

export async function updateForumThread(formData: FormData) {
  const user = await requireUser()
  const basePath = forumBasePath(user.role)

  if (!canWriteForum(user)) {
    return { ok: false, error: "Akun belum memiliki akses mengedit forum." }
  }

  const threadId = value(formData, "threadId")
  const title = value(formData, "title")
  const categoryId = value(formData, "categoryId")
  const bodyMarkdown = value(formData, "bodyMarkdown")
  const attachments = parseForumAttachments(formData)

  if (!threadId) return { ok: false, error: "Diskusi tidak valid." }
  if (!title) return { ok: false, error: "Judul wajib diisi." }
  if (title.length > 140) return { ok: false, error: "Judul maksimal 140 karakter." }
  if (!categoryId) return { ok: false, error: "Kategori wajib dipilih." }
  if (!bodyMarkdown && !attachments.length) {
    return { ok: false, error: "Isi diskusi atau gambar wajib diisi." }
  }

  const thread = (
    await db.$queryRaw<Array<{ id: string; authorId: string; slug: string }>>`
      SELECT id, "authorId", slug
      FROM "ForumThread"
      WHERE id = ${threadId}
        AND status::text <> 'HIDDEN'
      LIMIT 1
    `
  )[0]

  if (!thread) return { ok: false, error: "Diskusi tidak ditemukan." }
  if (thread.authorId !== user.id) {
    return { ok: false, error: "Kamu hanya bisa mengedit postingan sendiri." }
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

  const firstPost = (
    await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "ForumPost"
      WHERE "threadId" = ${thread.id}
        AND "authorId" = ${user.id}
      ORDER BY "createdAt" ASC
      LIMIT 1
    `
  )[0]

  if (!firstPost) return { ok: false, error: "Postingan tidak ditemukan." }

  const slug = await uniqueForumThreadSlug(title, thread.id)

  await db.$transaction(async (tx: any) => {
    await tx.$executeRaw`
      UPDATE "ForumThread"
      SET
        title = ${title},
        slug = ${slug},
        "categoryId" = ${categoryId},
        "updatedAt" = NOW()
      WHERE id = ${thread.id}
    `

    await tx.$executeRaw`
      UPDATE "ForumPost"
      SET
        "bodyMarkdown" = ${bodyMarkdown},
        "updatedAt" = NOW()
      WHERE id = ${firstPost.id}
    `

    await tx.$executeRaw`
      DELETE FROM "ForumPostAttachment"
      WHERE "postId" = ${firstPost.id}
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
          ${firstPost.id},
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
  revalidatePath(`/dashboard/forum/${slug}`)
  revalidatePath("/pharmacist/dashboard/forum")
  revalidatePath(`/pharmacist/dashboard/forum/${thread.slug}`)
  revalidatePath(`/pharmacist/dashboard/forum/${slug}`)
  revalidatePath("/admin/forum")

  return { ok: true, slug, href: `${basePath}/${slug}` }
}

export async function deleteForumThread(formData: FormData) {
  const user = await requireUser()
  const basePath = forumBasePath(user.role)

  if (!canWriteForum(user)) {
    return { ok: false, error: "Akun belum memiliki akses menghapus forum." }
  }

  const threadId = value(formData, "threadId")
  if (!threadId) return { ok: false, error: "Diskusi tidak valid." }

  const thread = (
    await db.$queryRaw<Array<{ id: string; authorId: string }>>`
      SELECT id, "authorId"
      FROM "ForumThread"
      WHERE id = ${threadId}
        AND status::text <> 'HIDDEN'
      LIMIT 1
    `
  )[0]

  if (!thread) return { ok: false, error: "Diskusi tidak ditemukan." }
  if (thread.authorId !== user.id) {
    return { ok: false, error: "Kamu hanya bisa menghapus postingan sendiri." }
  }

  await db.$executeRaw`
    DELETE FROM "ForumThread"
    WHERE id = ${thread.id}
  `

  revalidatePath("/dashboard/forum")
  revalidatePath("/pharmacist/dashboard/forum")
  revalidatePath("/admin/forum")

  return { ok: true, href: basePath }
}
