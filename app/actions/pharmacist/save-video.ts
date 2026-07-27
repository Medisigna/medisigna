"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomUUID } from "node:crypto"

import { activeContentCategoryExists } from "@/lib/content-categories"
import { db } from "@/lib/db"
import {
  extractYouTubeVideoId,
  uniqueVideoSlug,
} from "@/lib/educational-videos"
import { requireRole } from "@/lib/session"
import { fail, value } from "../shared"

type EditableVideo = {
  id: string
  title: string
  status: string
}

function optionalText(formData: FormData, name: string) {
  return value(formData, name) || null
}

export async function savePharmacistVideo(formData: FormData) {
  const user = await requireRole("PHARMACIST")
  const id = value(formData, "id")
  const path = id
    ? `/pharmacist/dashboard/tulis-video/${id}/edit`
    : "/pharmacist/dashboard/tulis-video/new"

  if (user.pharmacistProfile?.verificationStatus !== "VERIFIED") {
    fail(path, "Akun apoteker harus terverifikasi untuk menulis video.")
  }

  const editable = id
    ? (
        await db.$queryRaw<EditableVideo[]>`
          SELECT id, title, status::text AS status
          FROM "EducationalVideo"
          WHERE id = ${id}
            AND "authorId" = ${user.id}
          LIMIT 1
        `
      )[0]
    : null

  if (id && !editable) fail("/pharmacist/dashboard/tulis-video", "Video tidak ditemukan.")
  if (editable && editable.status !== "REJECTED") {
    fail(`/pharmacist/dashboard/tulis-video/${editable.id}`, "Hanya video yang ditolak yang bisa diperbaiki.")
  }

  const title = value(formData, "title")
  const category = value(formData, "category")
  const excerpt = value(formData, "excerpt")
  const youtubeUrl = value(formData, "youtubeUrl")
  const youtubeVideoId = extractYouTubeVideoId(youtubeUrl)

  if (!title) fail(path, "Judul wajib diisi.")
  if (!category) fail(path, "Kategori wajib diisi.")
  if (!(await activeContentCategoryExists(category))) fail(path, "Kategori tidak valid.")
  if (!excerpt) fail(path, "Ringkasan wajib diisi.")
  if (!youtubeUrl) fail(path, "Link YouTube wajib diisi.")
  if (!youtubeVideoId) fail(path, "Link harus berasal dari video YouTube yang valid.")

  const slug = await uniqueVideoSlug(title, editable?.id)
  const data = {
    title,
    slug,
    category,
    excerpt,
    youtubeUrl,
    youtubeVideoId,
    metaTitle: optionalText(formData, "metaTitle"),
    metaDescription: optionalText(formData, "metaDescription"),
    status: "DRAFT",
    adminNote: null,
    reviewedAt: null,
    publishedAt: null,
  }

  if (editable) {
    await db.$executeRaw`
      UPDATE "EducationalVideo"
      SET
        title = ${data.title},
        slug = ${data.slug},
        category = ${data.category},
        excerpt = ${data.excerpt},
        "youtubeUrl" = ${data.youtubeUrl},
        "youtubeVideoId" = ${data.youtubeVideoId},
        "metaTitle" = ${data.metaTitle},
        "metaDescription" = ${data.metaDescription},
        status = 'DRAFT'::"EducationalVideoPublicationStatus",
        "adminNote" = NULL,
        "reviewedAt" = ${data.reviewedAt},
        "publishedAt" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${editable.id}
        AND "authorId" = ${user.id}
    `
  } else {
    const videoId = randomUUID()
    await db.$executeRaw`
      INSERT INTO "EducationalVideo" (
        id,
        title,
        slug,
        category,
        excerpt,
        "youtubeUrl",
        "youtubeVideoId",
        "metaTitle",
        "metaDescription",
        status,
        "adminNote",
        "authorId",
        "reviewedAt",
        "publishedAt",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${videoId},
        ${data.title},
        ${data.slug},
        ${data.category},
        ${data.excerpt},
        ${data.youtubeUrl},
        ${data.youtubeVideoId},
        ${data.metaTitle},
        ${data.metaDescription},
        'DRAFT'::"EducationalVideoPublicationStatus",
        NULL,
        ${user.id},
        ${data.reviewedAt},
        NULL,
        NOW(),
        NOW()
      )
    `
  }

  revalidatePath("/admin/video")
  revalidatePath("/pharmacist/dashboard/tulis-video")
  redirect(
    `/pharmacist/dashboard/tulis-video?success=${encodeURIComponent(
      "Video dikirim untuk verifikasi admin."
    )}`
  )
}
