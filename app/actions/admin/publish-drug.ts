"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, ok, value } from "../shared"

export async function publishDrug(formData: FormData) {
  await requireRole("ADMIN")

  const id = value(formData, "id")
  const action = value(formData, "action")
  const path = id ? `/admin/obat/${id}` : "/admin/obat"

  if (!id) fail("/admin/obat", "Obat tidak ditemukan.")

  const drug = await db.drugInformation.findUnique({
    where: { id },
    select: {
      slug: true,
      reviewedAt: true,
      reviewer: {
        select: {
          pharmacistProfile: {
            select: { verificationStatus: true },
          },
        },
      },
    },
  })

  if (!drug) fail("/admin/obat", "Obat tidak ditemukan.")

  if (action === "publish") {
    if (!drug.reviewedAt) fail(path, "Tanggal review wajib diisi sebelum terbit.")
    if (drug.reviewer.pharmacistProfile?.verificationStatus !== "VERIFIED") {
      fail(path, "Reviewer harus apoteker terverifikasi.")
    }

    await db.drugInformation.update({
      where: { id },
      data: { status: "PUBLISHED" },
    })

    revalidatePath("/obat")
    revalidatePath(`/obat/${drug.slug}`)
    revalidatePath("/admin/obat")
    ok(path, "Informasi obat diterbitkan.")
  }

  await db.drugInformation.update({
    where: { id },
    data: { status: "DRAFT" },
  })

  revalidatePath("/obat")
  revalidatePath(`/obat/${drug.slug}`)
  revalidatePath("/admin/obat")
  ok(path, "Informasi obat dijadikan draft.")
}
