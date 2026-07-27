"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, ok, value } from "../shared"

type ReviewArticle = {
  id: string
  slug: string
  authorVerificationStatus: string | null
}

export async function publishArticle(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const action = value(formData, "action")
  const adminNote = value(formData, "adminNote")
  const path = id ? `/admin/artikel/${id}` : "/admin/artikel"

  if (!id) fail("/admin/artikel", "Artikel tidak ditemukan.")

  const article = (
    await db.$queryRaw<ReviewArticle[]>`
      SELECT
        a.id,
        a.slug,
        pharmacist_profile."verificationStatus"::text AS "authorVerificationStatus"
      FROM "Article" a
      JOIN "user" author ON author.id = a."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      WHERE a.id = ${id}
      LIMIT 1
    `
  )[0]

  if (!article) fail("/admin/artikel", "Artikel tidak ditemukan.")

  if (action === "publish") {
    if (article.authorVerificationStatus !== "VERIFIED") {
      fail(path, "Penulis harus apoteker terverifikasi.")
    }

    await db.$executeRaw`
      UPDATE "Article"
      SET
        status = 'PUBLISHED'::"ArticlePublicationStatus",
        "adminNote" = NULL,
        "reviewedAt" = NOW(),
        "publishedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    revalidatePath("/artikel")
    revalidatePath(`/artikel/${article.slug}`)
    revalidatePath("/admin/artikel")
    revalidatePath("/pharmacist/dashboard/tulis-artikel")
    ok(path, "Artikel diterbitkan.")
  }

  if (action === "reject") {
    if (!adminNote) fail(path, "Catatan penolakan wajib diisi.")

    await db.$executeRaw`
      UPDATE "Article"
      SET
        status = 'REJECTED'::"ArticlePublicationStatus",
        "adminNote" = ${adminNote},
        "publishedAt" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    revalidatePath("/artikel")
    revalidatePath(`/artikel/${article.slug}`)
    revalidatePath("/admin/artikel")
    revalidatePath("/pharmacist/dashboard/tulis-artikel")
    ok(path, "Artikel ditolak.")
  }

  await db.$executeRaw`
    UPDATE "Article"
    SET
      status = 'DRAFT'::"ArticlePublicationStatus",
      "adminNote" = NULL,
      "publishedAt" = NULL,
      "updatedAt" = NOW()
    WHERE id = ${id}
  `

  revalidatePath("/artikel")
  revalidatePath(`/artikel/${article.slug}`)
  revalidatePath("/admin/artikel")
  revalidatePath("/pharmacist/dashboard/tulis-artikel")
  ok(path, "Artikel dijadikan draft.")
}
