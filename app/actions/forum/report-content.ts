"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"

import { value } from "@/app/actions/shared"
import { canWriteForum } from "@/lib/forum"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/session"

export async function reportForumContent(formData: FormData) {
  const user = await requireUser()

  if (!canWriteForum(user)) {
    return { ok: false, error: "Akun belum memiliki akses melaporkan forum." }
  }

  const targetType = value(formData, "targetType")
  const targetId = value(formData, "targetId")
  const reason = value(formData, "reason")

  if (targetType !== "THREAD" && targetType !== "POST") {
    return { ok: false, error: "Target laporan tidak valid." }
  }
  if (!targetId) return { ok: false, error: "Konten tidak ditemukan." }
  if (!reason) return { ok: false, error: "Alasan laporan wajib diisi." }

  const target =
    targetType === "THREAD"
      ? (
          await db.$queryRaw<Array<{ id: string; slug: string }>>`
            SELECT id, slug
            FROM "ForumThread"
            WHERE id = ${targetId}
              AND status::text <> 'HIDDEN'
            LIMIT 1
          `
        )[0]
      : (
          await db.$queryRaw<Array<{ id: string; slug: string }>>`
            SELECT p.id, t.slug
            FROM "ForumPost" p
            JOIN "ForumThread" t ON t.id = p."threadId"
            WHERE p.id = ${targetId}
              AND p.status::text = 'VISIBLE'
              AND t.status::text <> 'HIDDEN'
            LIMIT 1
          `
        )[0]

  if (!target) return { ok: false, error: "Konten tidak ditemukan." }

  await db.$executeRaw`
    INSERT INTO "ForumReport" (
      id,
      "targetType",
      "threadId",
      "postId",
      "reporterId",
      reason,
      status,
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${randomUUID()},
      ${targetType}::"ForumReportTargetType",
      ${targetType === "THREAD" ? targetId : null},
      ${targetType === "POST" ? targetId : null},
      ${user.id},
      ${reason},
      'OPEN'::"ForumReportStatus",
      NOW(),
      NOW()
    )
  `

  revalidatePath("/admin/forum")
  revalidatePath(`/dashboard/forum/${target.slug}`)
  revalidatePath(`/pharmacist/dashboard/forum/${target.slug}`)

  return { ok: true }
}
