"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, ok, value } from "../shared"

type ReviewVideo = {
  id: string
  slug: string
  authorVerificationStatus: string | null
}

export async function publishVideo(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const action = value(formData, "action")
  const adminNote = value(formData, "adminNote")
  const path = id ? `/admin/video/${id}` : "/admin/video"

  if (!id) fail("/admin/video", "Video tidak ditemukan.")

  const video = (
    await db.$queryRaw<ReviewVideo[]>`
      SELECT
        v.id,
        v.slug,
        pharmacist_profile."verificationStatus"::text AS "authorVerificationStatus"
      FROM "EducationalVideo" v
      JOIN "user" author ON author.id = v."authorId"
      LEFT JOIN "PharmacistProfile" pharmacist_profile
        ON pharmacist_profile."userId" = author.id
      WHERE v.id = ${id}
      LIMIT 1
    `
  )[0]

  if (!video) fail("/admin/video", "Video tidak ditemukan.")

  if (action === "publish") {
    if (video.authorVerificationStatus !== "VERIFIED") {
      fail(path, "Penulis harus apoteker terverifikasi.")
    }

    await db.$executeRaw`
      UPDATE "EducationalVideo"
      SET
        status = 'PUBLISHED'::"EducationalVideoPublicationStatus",
        "adminNote" = NULL,
        "reviewedAt" = NOW(),
        "publishedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    revalidatePath("/video")
    revalidatePath(`/video/${video.slug}`)
    revalidatePath("/admin/video")
    revalidatePath("/pharmacist/dashboard/tulis-video")
    ok(path, "Video diterbitkan.")
  }

  if (action === "reject") {
    if (!adminNote) fail(path, "Catatan penolakan wajib diisi.")

    await db.$executeRaw`
      UPDATE "EducationalVideo"
      SET
        status = 'REJECTED'::"EducationalVideoPublicationStatus",
        "adminNote" = ${adminNote},
        "publishedAt" = NULL,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    revalidatePath("/video")
    revalidatePath(`/video/${video.slug}`)
    revalidatePath("/admin/video")
    revalidatePath("/pharmacist/dashboard/tulis-video")
    ok(path, "Video ditolak.")
  }

  await db.$executeRaw`
    UPDATE "EducationalVideo"
    SET
      status = 'DRAFT'::"EducationalVideoPublicationStatus",
      "adminNote" = NULL,
      "publishedAt" = NULL,
      "updatedAt" = NOW()
    WHERE id = ${id}
  `

  revalidatePath("/video")
  revalidatePath(`/video/${video.slug}`)
  revalidatePath("/admin/video")
  revalidatePath("/pharmacist/dashboard/tulis-video")
  ok(path, "Video dijadikan draft.")
}
