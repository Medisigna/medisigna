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

type ReplyPostRow = {
  authorId: string
  isFirstPost: boolean
  slug: string
  threadId: string
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

async function replyPost(postId: string) {
  return (
    await db.$queryRaw<ReplyPostRow[]>`
      SELECT
        p."authorId",
        p."threadId",
        t.slug,
        (
          p.id = (
            SELECT first_post.id
            FROM "ForumPost" first_post
            WHERE first_post."threadId" = p."threadId"
            ORDER BY first_post."createdAt" ASC
            LIMIT 1
          )
        ) AS "isFirstPost"
      FROM "ForumPost" p
      JOIN "ForumThread" t ON t.id = p."threadId"
      WHERE p.id = ${postId}
        AND p.status::text = 'VISIBLE'
      LIMIT 1
    `
  )[0]
}

function revalidateForumThread(slug: string) {
  revalidatePath("/dashboard/forum")
  revalidatePath(`/dashboard/forum/${slug}`)
  revalidatePath("/pharmacist/dashboard/forum")
  revalidatePath(`/pharmacist/dashboard/forum/${slug}`)
  revalidatePath("/admin/forum")
}

export async function updateForumReply(formData: FormData) {
  const user = await requireUser()
  if (!canWriteForum(user)) {
    return { ok: false, error: "Akun belum memiliki akses mengedit balasan." }
  }

  const postId = value(formData, "postId")
  const bodyMarkdown = value(formData, "bodyMarkdown")
  const attachments = parseForumAttachments(formData)

  if (!postId) return { ok: false, error: "Balasan tidak valid." }
  if (!bodyMarkdown && !attachments.length) {
    return { ok: false, error: "Balasan atau gambar wajib diisi." }
  }

  const post = await replyPost(postId)
  if (!post || post.isFirstPost) return { ok: false, error: "Balasan tidak ditemukan." }
  if (post.authorId !== user.id) {
    return { ok: false, error: "Kamu hanya bisa mengedit balasan sendiri." }
  }

  await db.$transaction(async (tx: any) => {
    await tx.$executeRaw`
      UPDATE "ForumPost"
      SET "bodyMarkdown" = ${bodyMarkdown}, "updatedAt" = NOW()
      WHERE id = ${postId}
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

  revalidateForumThread(post.slug)
  return { ok: true }
}

export async function deleteForumReply(formData: FormData) {
  const user = await requireUser()
  if (!canWriteForum(user)) {
    return { ok: false, error: "Akun belum memiliki akses menghapus balasan." }
  }

  const postId = value(formData, "postId")
  if (!postId) return { ok: false, error: "Balasan tidak valid." }

  const post = await replyPost(postId)
  if (!post || post.isFirstPost) return { ok: false, error: "Balasan tidak ditemukan." }
  if (post.authorId !== user.id) {
    return { ok: false, error: "Kamu hanya bisa menghapus balasan sendiri." }
  }

  await db.$transaction(async (tx: any) => {
    await tx.$executeRaw`
      DELETE FROM "ForumPost"
      WHERE id = ${postId}
    `

    await tx.$executeRaw`
      UPDATE "ForumThread"
      SET
        "lastPostAt" = COALESCE(
          (
            SELECT MAX(p."createdAt")
            FROM "ForumPost" p
            WHERE p."threadId" = ${post.threadId}
          ),
          NOW()
        ),
        "updatedAt" = NOW()
      WHERE id = ${post.threadId}
    `
  })

  revalidateForumThread(post.slug)
  return { ok: true }
}
