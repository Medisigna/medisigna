"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, ok, requireText, value } from "../shared"

export async function reviewPharmacist(formData: FormData) {
  await requireRole("ADMIN")
  const profileId = requireText(formData, "profileId", "Pendaftaran", "/admin")
  const action = value(formData, "action")
  const adminNote = value(formData, "adminNote")
  const verificationStatus =
    action === "approve"
      ? "VERIFIED"
      : action === "reject"
        ? "REJECTED"
        : "NEEDS_REVISION"

  if (verificationStatus !== "VERIFIED" && !adminNote) {
    fail("/admin", "Catatan admin wajib diisi.")
  }

  await db.pharmacistProfile.update({
    where: { id: profileId },
    data: { verificationStatus, adminNote: adminNote || null },
  })

  revalidatePath("/admin")
  ok("/admin", "Status apoteker diperbarui.")
}
