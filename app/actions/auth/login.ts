"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { homeForRole } from "@/lib/session"
import { emailForLogin, fail, value } from "../shared"

export async function login(formData: FormData) {
  const identifier = value(formData, "identifier")
  const path = `/login?identifier=${encodeURIComponent(identifier)}`
  if (!identifier) fail("/login", "Email atau nomor WhatsApp wajib diisi.")

  const password = value(formData, "password")
  if (!password) fail(path, "Password wajib diisi.")

  const email = await emailForLogin(identifier)

  if (!email) fail(path, "Email, nomor WhatsApp, atau password salah.")

  try {
    await auth.api.signInEmail({
      body: { email, password },
    })
  } catch {
    fail(path, "Email, nomor WhatsApp, atau password salah.")
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user || user.status !== "ACTIVE") {
    await auth.api.signOut({ headers: await headers() })
    fail(path, "Akun tidak aktif.")
  }

  redirect(homeForRole(user.role))
}
