"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, requireText, safeCallbackPath, value } from "../shared"

export async function reviewPharmacist(formData: FormData) {
  await requireRole("ADMIN")
  const path = safeCallbackPath(formData, "/admin")
  const profileId = requireText(formData, "profileId", "Pendaftaran", path)
  const action = value(formData, "action")
  const adminNote = value(formData, "adminNote")
  const verificationStatus =
    action === "approve"
      ? "VERIFIED"
      : action === "reject"
        ? "REJECTED"
        : "NEEDS_REVISION"

  if (verificationStatus !== "VERIFIED" && !adminNote) {
    fail(path, "Catatan admin wajib diisi.")
  }

  await db.pharmacistProfile.update({
    where: { id: profileId },
    data: { verificationStatus, adminNote: adminNote || null },
  })

  revalidatePath("/admin")
  redirect(
    `${path}${path.includes("?") ? "&" : "?"}success=${encodeURIComponent(
      "Status apoteker diperbarui."
    )}`
  )
}
