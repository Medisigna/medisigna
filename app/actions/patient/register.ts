"use server"

import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  existingAccount,
  fail,
  passwordPair,
  patientIdentity,
  requireText,
  safeCallbackPath,
} from "../shared"

export async function registerPatient(formData: FormData) {
  const callbackUrl = safeCallbackPath(formData, "")
  const path = callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register"
  const name = requireText(formData, "name", "Nama lengkap", path)
  const identity = patientIdentity(formData, path)
  const password = passwordPair(formData, path)

  if (await existingAccount(identity.email, identity.phone)) {
    fail(path, "Email atau nomor WhatsApp sudah dipakai.")
  }

  try {
    const result = (await auth.api.signUpEmail({
      body: {
        name,
        email: identity.email,
        password,
        phone: identity.phone,
        role: "PATIENT",
        status: "ACTIVE",
      },
    })) as { user?: { id?: string } }

    if (result.user?.id) {
      await db.user.update({
        where: { id: result.user.id },
        data: { phone: identity.phone, role: "PATIENT", status: "ACTIVE" },
      })
      await db.patientProfile.create({ data: { userId: result.user.id, phone: identity.phone } })
    }
  } catch {
    fail(path, "Registrasi gagal. Periksa data lalu coba lagi.")
  }

  redirect(callbackUrl || "/dashboard")
}
