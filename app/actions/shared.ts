import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { env } from "@/lib/env"

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim()
}

export function safeCallbackPath(formData: FormData, fallback: string) {
  const path = value(formData, "callbackUrl")
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback
}

export function fail(path: string, message: string) {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`)
}

export function ok(path: string, message = "Perubahan tersimpan.") {
  redirect(`${path}?success=${encodeURIComponent(message)}`)
}

export function splitTopics(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function passwordPair(formData: FormData, path: string) {
  const password = value(formData, "password")
  const confirmPassword = value(formData, "confirmPassword")

  if (password.length < 8) fail(path, "Password minimal 8 karakter.")
  if (password !== confirmPassword) fail(path, "Konfirmasi password tidak sama.")

  return password
}

export function accountIdentity(raw: string, path: string) {
  const identifier = raw.trim().toLowerCase()

  if (!identifier) fail(path, "Email atau nomor WhatsApp wajib diisi.")
  if (EMAIL_RE.test(identifier)) return { email: identifier, phone: undefined }

  const digits = identifier.replace(/\D/g, "")
  if (digits.length < 8) fail(path, "Nomor WhatsApp tidak valid.")

  return {
    email: `wa-${digits}@medisigna.local`,
    phone: identifier,
  }
}

export function patientIdentity(formData: FormData, path: string) {
  const email = value(formData, "email").toLowerCase()
  const phone = value(formData, "phone")

  if (!email) fail(path, "Email wajib diisi.")
  if (!EMAIL_RE.test(email)) fail(path, "Email tidak valid.")
  if (!phone) fail(path, "Nomor WhatsApp wajib diisi.")
  if (phone.replace(/\D/g, "").length < 8) fail(path, "Nomor WhatsApp tidak valid.")

  return { email, phone }
}

export async function existingAccount(email: string, phone?: string) {
  return db.user.findFirst({
    where: {
      OR: [{ email }, ...(phone ? [{ phone }] : [])],
    },
  })
}

export async function emailForLogin(identifier: string) {
  const normalized = identifier.trim().toLowerCase()
  if (EMAIL_RE.test(normalized)) return normalized

  const user = await db.user.findFirst({
    where: { phone: normalized },
    select: { email: true },
  })

  return user?.email
}

export function requireText(formData: FormData, name: string, label: string, path: string) {
  const text = value(formData, name)
  if (!text) fail(path, `${label} wajib diisi.`)
  return text
}

export async function fileDataUrl(
  formData: FormData,
  name: string,
  label: string,
  allowedTypes: string[],
  path: string,
  required = true
) {
  const file = formData.get(name)
  if (!(file instanceof File) || file.size === 0) {
    if (required) fail(path, `${label} wajib diisi.`)
    return undefined
  }

  if (!allowedTypes.includes(file.type)) fail(path, `${label} memiliki format tidak valid.`)

  const maxBytes = (env.UPLOAD_MAX_SIZE_MB ?? 2) * 1024 * 1024
  if (file.size > maxBytes) fail(path, `${label} maksimal ${env.UPLOAD_MAX_SIZE_MB ?? 2}MB.`)

  // ponytail: data URL upload is enough for MVP; move to object storage when files matter.
  const buffer = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buffer.toString("base64")}`
}
