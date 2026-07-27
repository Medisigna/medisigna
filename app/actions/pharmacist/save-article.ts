"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { randomUUID } from "node:crypto"

import { uniqueArticleSlug } from "@/lib/articles"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, value } from "../shared"

type EditableArticle = {
  id: string
  title: string
  status: string
}

function optionalText(formData: FormData, name: string) {
  return value(formData, name) || null
}

export async function savePharmacistArticle(formData: FormData) {
  const user = await requireRole("PHARMACIST")
  const id = value(formData, "id")
  const path = id
    ? `/pharmacist/dashboard/tulis-artikel/${id}/edit`
    : "/pharmacist/dashboard/tulis-artikel/new"

  if (user.pharmacistProfile?.verificationStatus !== "VERIFIED") {
    fail(path, "Akun apoteker harus terverifikasi untuk menulis artikel.")
  }

  const editable = id
    ? (
        await db.$queryRaw<EditableArticle[]>`
          SELECT id, title, status::text AS status
          FROM "Article"
          WHERE id = ${id}
            AND "authorId" = ${user.id}
          LIMIT 1
        `
      )[0]
    : null

  if (id && !editable) fail("/pharmacist/dashboard/tulis-artikel", "Artikel tidak ditemukan.")
  if (editable && editable.status !== "REJECTED") {
    fail(`/pharmacist/dashboard/tulis-artikel/${editable.id}`, "Hanya artikel yang ditolak yang bisa diperbaiki.")
  }

  const title = value(formData, "title")
  const category = value(formData, "category")
  const excerpt = value(formData, "excerpt")
  const contentMarkdown = value(formData, "contentMarkdown")

  if (!title) fail(path, "Judul wajib diisi.")
  if (!category) fail(path, "Kategori wajib diisi.")
  if (!excerpt) fail(path, "Ringkasan wajib diisi.")
  if (!contentMarkdown) fail(path, "Isi artikel wajib diisi.")

  const slug = await uniqueArticleSlug(title, editable?.id)
  const data = {
    title,
    slug,
    category,
    excerpt,
    contentMarkdown,
    metaTitle: optionalText(formData, "metaTitle"),
    metaDescription: optionalText(formData, "metaDescription"),
    coverImageUrl: optionalText(formData, "coverImageUrl"),
    status: "DRAFT",
    adminNote: null,
    reviewedAt: null,
    publishedAt: null,
  }

  if (editable) {
    await db.$executeRaw`
      UPDATE "Article"
      SET
        title = ${data.title},
        slug = ${data.slug},
        category = ${data.category},
        excerpt = ${data.excerpt},
        "contentMarkdown" = ${data.contentMarkdown},
        "metaTitle" = ${data.metaTitle},
        "metaDescription" = ${data.metaDescription},
        "coverImageUrl" = ${data.coverImageUrl},
        status = 'DRAFT'::"ArticlePublicationStatus",
        "adminNote" = NULL,
        "reviewedAt" = ${data.reviewedAt},
        "publishedAt" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${editable.id}
        AND "authorId" = ${user.id}
    `
  } else {
    const articleId = randomUUID()
    await db.$executeRaw`
      INSERT INTO "Article" (
        id,
        title,
        slug,
        category,
        excerpt,
        "contentMarkdown",
        "metaTitle",
        "metaDescription",
        "coverImageUrl",
        status,
        "adminNote",
        "authorId",
        "reviewedAt",
        "publishedAt",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${articleId},
        ${data.title},
        ${data.slug},
        ${data.category},
        ${data.excerpt},
        ${data.contentMarkdown},
        ${data.metaTitle},
        ${data.metaDescription},
        ${data.coverImageUrl},
        'DRAFT'::"ArticlePublicationStatus",
        NULL,
        ${user.id},
        ${data.reviewedAt},
        NULL,
        NOW(),
        NOW()
      )
    `
  }

  revalidatePath("/admin/artikel")
  revalidatePath("/pharmacist/dashboard/tulis-artikel")
  redirect(
    `/pharmacist/dashboard/tulis-artikel?success=${encodeURIComponent(
      "Artikel dikirim untuk verifikasi admin."
    )}`
  )
}
