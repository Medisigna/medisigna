"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"

import {
  duplicateContentCategoryName,
  uniqueContentCategorySlug,
} from "@/lib/content-categories"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, ok, value } from "../shared"

export async function saveContentCategory(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const name = value(formData, "name")
  const path = "/admin/kategori"

  if (!name) fail(path, "Nama kategori wajib diisi.")
  if (await duplicateContentCategoryName(name, id || undefined)) {
    fail(path, "Kategori sudah ada.")
  }

  const slug = await uniqueContentCategorySlug(name, id || undefined)

  if (id) {
    const current = (
      await db.$queryRaw<Array<{ name: string }>>`
        SELECT name
        FROM "ContentCategory"
        WHERE id = ${id}
        LIMIT 1
      `
    )[0]

    if (!current) fail(path, "Kategori tidak ditemukan.")

    await db.$executeRaw`
      UPDATE "ContentCategory"
      SET
        name = ${name},
        slug = ${slug},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    await Promise.all([
      db.$executeRaw`
        UPDATE "Article"
        SET
          category = ${name},
          "updatedAt" = NOW()
        WHERE category = ${current.name}
      `,
      db.$executeRaw`
        UPDATE "EducationalVideo"
        SET
          category = ${name},
          "updatedAt" = NOW()
        WHERE category = ${current.name}
      `,
    ])
  } else {
    await db.$executeRaw`
      INSERT INTO "ContentCategory" (
        id,
        name,
        slug,
        "isActive",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${randomUUID()},
        ${name},
        ${slug},
        true,
        NOW(),
        NOW()
      )
    `
  }

  revalidatePath("/admin/kategori")
  revalidatePath("/admin/artikel")
  revalidatePath("/admin/video")
  revalidatePath("/artikel")
  revalidatePath("/video")
  revalidatePath("/pharmacist/dashboard/tulis-artikel/new")
  revalidatePath("/pharmacist/dashboard/tulis-video/new")
  ok(path, id ? "Kategori diperbarui." : "Kategori ditambahkan.")
}

export async function toggleContentCategory(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const isActive = value(formData, "isActive") === "true"

  if (!id) fail("/admin/kategori", "Kategori tidak ditemukan.")

  await db.$executeRaw`
    UPDATE "ContentCategory"
    SET
      "isActive" = ${!isActive},
      "updatedAt" = NOW()
    WHERE id = ${id}
  `

  revalidatePath("/admin/kategori")
  revalidatePath("/pharmacist/dashboard/tulis-artikel/new")
  revalidatePath("/pharmacist/dashboard/tulis-video/new")
  ok("/admin/kategori", isActive ? "Kategori dinonaktifkan." : "Kategori diaktifkan.")
}
