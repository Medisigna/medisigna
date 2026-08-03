"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"
import { Prisma } from "@prisma/client"

import { fail, ok, value } from "@/app/actions/shared"
import { forumSlug } from "@/lib/forum"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"

function revalidateForum(slug?: string | null) {
  revalidatePath("/dashboard/forum")
  revalidatePath("/pharmacist/dashboard/forum")
  revalidatePath("/admin/forum")
  if (slug) {
    revalidatePath(`/dashboard/forum/${slug}`)
    revalidatePath(`/pharmacist/dashboard/forum/${slug}`)
  }
}

async function uniqueForumCategorySlug(name: string, currentId?: string) {
  const base = forumSlug(name)

  for (let suffix = 1; ; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`
    const rows = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "ForumCategory"
      WHERE slug = ${slug}
        ${currentId ? Prisma.sql`AND id <> ${currentId}` : Prisma.empty}
      LIMIT 1
    `

    if (!rows.length) return slug
  }
}

export async function saveForumCategory(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const name = value(formData, "name")
  const description = value(formData, "description") || null
  const isActive = formData.get("isActive") === "on"
  const path = "/admin/forum/kategori"

  if (!name) fail(path, "Nama kategori wajib diisi.")

  const slug = await uniqueForumCategorySlug(name, id || undefined)

  if (id) {
    const updated = await db.$executeRaw`
      UPDATE "ForumCategory"
      SET
        name = ${name},
        slug = ${slug},
        description = ${description},
        "isActive" = ${isActive},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    if (!updated) fail(path, "Kategori tidak ditemukan.")
  } else {
    await db.$executeRaw`
      INSERT INTO "ForumCategory" (
        id,
        name,
        slug,
        description,
        "isActive",
        "createdAt",
        "updatedAt"
      )
      VALUES (${randomUUID()}, ${name}, ${slug}, ${description}, ${isActive}, NOW(), NOW())
    `
  }

  revalidateForum()
  revalidatePath("/admin/forum/kategori")
  ok(path, "Kategori forum tersimpan.")
}

export async function moderateForum(formData: FormData) {
  const user = await requireRole("ADMIN")
  const targetType = value(formData, "targetType")
  const action = value(formData, "action")
  const id = value(formData, "id")
  const reason = value(formData, "reason")
  const resolutionNote = value(formData, "resolutionNote") || null
  const path = "/admin/forum"

  if (!id) fail(path, "Konten tidak ditemukan.")

  if (targetType === "THREAD") {
    const thread = (
      await db.$queryRaw<Array<{ id: string; slug: string }>>`
        SELECT id, slug
        FROM "ForumThread"
        WHERE id = ${id}
        LIMIT 1
      `
    )[0]

    if (!thread) fail(path, "Thread tidak ditemukan.")

    if (action === "hide") {
      if (!reason) fail(path, "Alasan wajib diisi.")
      await db.$executeRaw`
        UPDATE "ForumThread"
        SET
          status = 'HIDDEN'::"ForumThreadStatus",
          "hiddenAt" = NOW(),
          "hiddenById" = ${user.id},
          "hiddenReason" = ${reason},
          "updatedAt" = NOW()
        WHERE id = ${id}
      `
    } else if (action === "restore") {
      await db.$executeRaw`
        UPDATE "ForumThread"
        SET
          status = CASE WHEN "lockedAt" IS NULL THEN 'ACTIVE'::"ForumThreadStatus" ELSE 'LOCKED'::"ForumThreadStatus" END,
          "hiddenAt" = NULL,
          "hiddenById" = NULL,
          "hiddenReason" = NULL,
          "updatedAt" = NOW()
        WHERE id = ${id}
      `
    } else if (action === "lock") {
      await db.$executeRaw`
        UPDATE "ForumThread"
        SET
          status = 'LOCKED'::"ForumThreadStatus",
          "lockedAt" = NOW(),
          "lockedById" = ${user.id},
          "updatedAt" = NOW()
        WHERE id = ${id}
          AND status::text <> 'HIDDEN'
      `
    } else if (action === "unlock") {
      await db.$executeRaw`
        UPDATE "ForumThread"
        SET
          status = 'ACTIVE'::"ForumThreadStatus",
          "lockedAt" = NULL,
          "lockedById" = NULL,
          "updatedAt" = NOW()
        WHERE id = ${id}
          AND status::text <> 'HIDDEN'
      `
    } else if (action === "pin" || action === "unpin") {
      await db.$executeRaw`
        UPDATE "ForumThread"
        SET "isPinned" = ${action === "pin"}, "updatedAt" = NOW()
        WHERE id = ${id}
      `
    } else {
      fail(path, "Aksi thread tidak valid.")
    }

    revalidateForum(thread.slug)
    ok(path, "Moderasi thread tersimpan.")
  }

  if (targetType === "POST") {
    const post = (
      await db.$queryRaw<Array<{ id: string; slug: string }>>`
        SELECT p.id, t.slug
        FROM "ForumPost" p
        JOIN "ForumThread" t ON t.id = p."threadId"
        WHERE p.id = ${id}
        LIMIT 1
      `
    )[0]

    if (!post) fail(path, "Post tidak ditemukan.")

    if (action === "hide") {
      if (!reason) fail(path, "Alasan wajib diisi.")
      await db.$executeRaw`
        UPDATE "ForumPost"
        SET
          status = 'HIDDEN'::"ForumPostStatus",
          "hiddenAt" = NOW(),
          "hiddenById" = ${user.id},
          "hiddenReason" = ${reason},
          "updatedAt" = NOW()
        WHERE id = ${id}
      `
    } else if (action === "restore") {
      await db.$executeRaw`
        UPDATE "ForumPost"
        SET
          status = 'VISIBLE'::"ForumPostStatus",
          "hiddenAt" = NULL,
          "hiddenById" = NULL,
          "hiddenReason" = NULL,
          "updatedAt" = NOW()
        WHERE id = ${id}
      `
    } else {
      fail(path, "Aksi post tidak valid.")
    }

    revalidateForum(post.slug)
    ok(path, "Moderasi post tersimpan.")
  }

  if (targetType === "REPORT") {
    if (action !== "resolve" && action !== "dismiss") {
      fail(path, "Aksi laporan tidak valid.")
    }

    await db.$executeRaw`
      UPDATE "ForumReport"
      SET
        status = ${action === "resolve" ? "RESOLVED" : "DISMISSED"}::"ForumReportStatus",
        "resolvedAt" = NOW(),
        "resolvedById" = ${user.id},
        "resolutionNote" = ${resolutionNote},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `

    revalidateForum()
    ok(path, "Laporan diperbarui.")
  }

  fail(path, "Target moderasi tidak valid.")
}
