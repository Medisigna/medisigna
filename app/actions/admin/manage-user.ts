"use server"

import { randomBytes, randomInt, randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { hashPassword } from "better-auth/crypto"
import { Prisma, type PharmacistAvailabilityStatus } from "@prisma/client"

import { EMAIL_RE, splitTopics, value } from "@/app/actions/shared"
import { db } from "@/lib/db"
import { env } from "@/lib/env"
import { requireRole } from "@/lib/session"
import {
  adminAccountStatuses,
  adminPharmacistStatuses,
  adminUserRoles,
  type AccountStatusValue,
  type PharmacistVerificationStatusValue,
  type UserRoleValue,
} from "@/lib/admin-users"

export type AdminUserActionResult =
  | {
      ok: true
      message: string
      userId?: string
      temporaryPassword?: string
    }
  | {
      ok: false
      error: string
    }

type AdminAuditSnapshot = Record<string, unknown>
type SqlExecutor = Pick<Prisma.TransactionClient, "$executeRaw">

function actionOk(message: string, extra: Omit<Extract<AdminUserActionResult, { ok: true }>, "ok" | "message"> = {}) {
  return { ok: true, message, ...extra } satisfies AdminUserActionResult
}

function actionError(error: string): AdminUserActionResult {
  return { ok: false, error }
}

function parseOption<T extends readonly string[]>(raw: string, options: T): T[number] | null {
  return (options as readonly string[]).includes(raw) ? (raw as T[number]) : null
}

function requireField(formData: FormData, name: string, label: string) {
  const text = value(formData, name)
  if (!text) throw new Error(`${label} wajib diisi.`)
  return text
}

function optionalField(formData: FormData, name: string) {
  return value(formData, name) || null
}

async function optionalFileDataUrl(formData: FormData, name: string, label: string, allowedTypes: string[]) {
  const file = formData.get(name)
  if (!(file instanceof File) || file.size === 0) return { ok: true as const, url: undefined }

  if (!allowedTypes.includes(file.type)) return { ok: false as const, error: `${label} memiliki format tidak valid.` }

  const maxMb = env.UPLOAD_MAX_SIZE_MB ?? 2
  const maxBytes = maxMb * 1024 * 1024
  if (file.size > maxBytes) return { ok: false as const, error: `${label} maksimal ${maxMb}MB.` }

  const buffer = Buffer.from(await file.arrayBuffer())
  return { ok: true as const, url: `data:${file.type};base64,${buffer.toString("base64")}` }
}

function userSnapshot(user: {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  status: string
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  }
}

function profileSnapshot(profile: Record<string, unknown> | null | undefined) {
  if (!profile) return null
  return profile
}

function jsonSql(value: unknown) {
  return value === undefined
    ? Prisma.sql`NULL`
    : Prisma.sql`${JSON.stringify(value)}::jsonb`
}

async function recordAdminAudit(
  executor: SqlExecutor,
  {
    actorId,
    targetUserId,
    action,
    before,
    after,
    metadata,
  }: {
    actorId: string
    targetUserId: string
    action: string
    before?: AdminAuditSnapshot | null
    after?: AdminAuditSnapshot | null
    metadata?: AdminAuditSnapshot | null
  }
) {
  await executor.$executeRaw`
    INSERT INTO "AdminAuditLog" ("id", "actorId", "targetUserId", "action", "before", "after", "metadata")
    VALUES (
      ${randomUUID()},
      ${actorId},
      ${targetUserId},
      ${action},
      ${jsonSql(before)},
      ${jsonSql(after)},
      ${jsonSql(metadata)}
    )
  `
}

function generateTemporaryPassword() {
  return `Medisigna-${randomBytes(4).toString("hex")}-${randomInt(10, 99)}!`
}

async function upsertCredentialPassword(
  executor: Pick<Prisma.TransactionClient, "account">,
  userId: string,
  password: string
) {
  const hashedPassword = await hashPassword(password)
  const credentialAccount = await executor.account.findFirst({
    where: { userId, providerId: "credential" },
  })

  if (credentialAccount) {
    await executor.account.update({
      where: { id: credentialAccount.id },
      data: { accountId: userId, password: hashedPassword },
    })
    return
  }

  await executor.account.create({
    data: {
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
    },
  })
}

async function duplicateUser(email: string, phone: string | null, currentUserId?: string) {
  return db.user.findFirst({
    where: {
      ...(currentUserId ? { NOT: { id: currentUserId } } : {}),
      OR: [{ email }, ...(phone ? [{ phone }] : [])],
    },
    select: { id: true },
  })
}

async function duplicateStrNumber(strNumber: string, userId: string) {
  return db.pharmacistProfile.findFirst({
    where: {
      strNumber,
      NOT: { userId },
    },
    select: { id: true },
  })
}

async function activeAdminCountExcluding(userId: string) {
  return db.user.count({
    where: {
      role: "ADMIN",
      status: "ACTIVE",
      NOT: { id: userId },
    },
  })
}

async function guardAdminChange({
  actorId,
  target,
  nextRole,
  nextStatus,
}: {
  actorId: string
  target: {
    id: string
    name: string
    email: string
    phone: string | null
    role: string
    status: string
  }
  nextRole: UserRoleValue
  nextStatus: AccountStatusValue
}) {
  const before = userSnapshot(target)

  if (target.id === actorId && nextStatus === "INACTIVE") {
    await recordAdminAudit(db, {
      actorId,
      targetUserId: target.id,
      action: "USER_UPDATE_REJECTED",
      before,
      metadata: { reason: "self_deactivation" },
    })
    return "Admin tidak bisa menonaktifkan akun sendiri."
  }

  if (target.id === actorId && nextRole !== target.role) {
    await recordAdminAudit(db, {
      actorId,
      targetUserId: target.id,
      action: "USER_UPDATE_REJECTED",
      before,
      metadata: { reason: "self_role_change" },
    })
    return "Admin tidak bisa mengubah role akun sendiri."
  }

  const removesActiveAdmin =
    target.role === "ADMIN" &&
    target.status === "ACTIVE" &&
    (nextRole !== "ADMIN" || nextStatus !== "ACTIVE")

  if (removesActiveAdmin && (await activeAdminCountExcluding(target.id)) < 1) {
    await recordAdminAudit(db, {
      actorId,
      targetUserId: target.id,
      action: "USER_UPDATE_REJECTED",
      before,
      metadata: { reason: "last_active_admin" },
    })
    return "Admin aktif terakhir tidak bisa dinonaktifkan atau diturunkan rolenya."
  }

  return null
}

function parseDateField(raw: string) {
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) throw new Error("Tanggal lahir tidak valid.")
  return date
}

function parseAge(raw: string) {
  if (!raw) return null
  const age = Number(raw)
  if (!Number.isInteger(age) || age < 0) throw new Error("Umur tidak valid.")
  return age
}

function revalidateUserManagement(userId?: string) {
  revalidatePath("/admin/users")
  if (userId) revalidatePath(`/admin/users/${userId}`)
}

export async function createAdminUser(formData: FormData): Promise<AdminUserActionResult> {
  const actor = await requireRole("ADMIN")

  try {
    const name = requireField(formData, "name", "Nama")
    const email = requireField(formData, "email", "Email").toLowerCase()
    const phone = optionalField(formData, "phone")
    const roleValue = parseOption(value(formData, "role"), adminUserRoles)
    const statusValue = parseOption(value(formData, "status"), adminAccountStatuses)

    if (!EMAIL_RE.test(email)) return actionError("Email tidak valid.")
    if (!roleValue || roleValue === "ALL") return actionError("Role tidak valid.")
    if (!statusValue || statusValue === "ALL") return actionError("Status tidak valid.")
    if (phone && phone.replace(/\D/g, "").length < 8) return actionError("Nomor WhatsApp tidak valid.")
    if (await duplicateUser(email, phone)) return actionError("Email atau nomor WhatsApp sudah dipakai.")

    const role = roleValue as UserRoleValue
    const status = statusValue as AccountStatusValue
    const temporaryPassword = generateTemporaryPassword()
    const userId = randomUUID()

    const createdUser = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          name,
          email,
          emailVerified: true,
          phone,
          role,
          status,
        },
      })

      await upsertCredentialPassword(tx, user.id, temporaryPassword)

      if (role === "PATIENT") {
        await tx.patientProfile.create({
          data: { userId: user.id, phone },
        })
      }

      if (role === "PHARMACIST") {
        const strNumber = requireField(formData, "strNumber", "Nomor STR")
        if (await duplicateStrNumber(strNumber, user.id)) {
          throw new Error("Nomor STR sudah terdaftar.")
        }

        const verificationStatusValue =
          parseOption(value(formData, "verificationStatus") || "VERIFIED", adminPharmacistStatuses) ?? "VERIFIED"

        if (verificationStatusValue === "ALL") throw new Error("Status verifikasi tidak valid.")
        const verificationStatus = verificationStatusValue as PharmacistVerificationStatusValue

        await tx.pharmacistProfile.create({
          data: {
            userId: user.id,
            title: requireField(formData, "title", "Gelar"),
            strNumber,
            profilePhotoUrl: optionalField(formData, "profilePhotoUrl"),
            bio: requireField(formData, "bio", "Bio"),
            topics: splitTopics(requireField(formData, "topics", "Topik bantuan")),
            practiceLocation: requireField(formData, "practiceLocation", "Lokasi praktik"),
            serviceHours: requireField(formData, "serviceHours", "Jam layanan"),
            experienceSummary: requireField(formData, "experienceSummary", "Pengalaman"),
            strDocumentUrl: optionalField(formData, "strDocumentUrl"),
            verificationStatus,
            availabilityStatus: "OFFLINE",
            adminNote: optionalField(formData, "adminNote"),
          },
        })
      }

      await recordAdminAudit(tx, {
        actorId: actor.id,
        targetUserId: user.id,
        action: "USER_CREATED",
        after: userSnapshot(user),
        metadata: { role, status },
      })

      return user
    })

    revalidateUserManagement(createdUser.id)
    return actionOk("User dibuat.", {
      userId: createdUser.id,
      temporaryPassword,
    })
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "User gagal dibuat.")
  }
}

export async function updateAdminUser(formData: FormData): Promise<AdminUserActionResult> {
  const actor = await requireRole("ADMIN")

  try {
    const userId = requireField(formData, "userId", "User")
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true },
    })
    if (!target) return actionError("User tidak ditemukan.")

    const name = requireField(formData, "name", "Nama")
    const email = requireField(formData, "email", "Email").toLowerCase()
    const phone = optionalField(formData, "phone")
    const roleValue = parseOption(value(formData, "role"), adminUserRoles)
    const statusValue = parseOption(value(formData, "status"), adminAccountStatuses)

    if (!EMAIL_RE.test(email)) return actionError("Email tidak valid.")
    if (!roleValue || roleValue === "ALL") return actionError("Role tidak valid.")
    if (!statusValue || statusValue === "ALL") return actionError("Status tidak valid.")
    if (phone && phone.replace(/\D/g, "").length < 8) return actionError("Nomor WhatsApp tidak valid.")
    if (await duplicateUser(email, phone, userId)) {
      return actionError("Email atau nomor WhatsApp sudah dipakai.")
    }

    const role = roleValue as UserRoleValue
    const status = statusValue as AccountStatusValue
    const guardError = await guardAdminChange({ actorId: actor.id, target, nextRole: role, nextStatus: status })
    if (guardError) return actionError(guardError)

    const before = userSnapshot(target)
    const updated = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { name, email, phone, role, status },
      })

      if (status === "INACTIVE") {
        await tx.session.deleteMany({ where: { userId } })
      }

      if (role === "PATIENT") {
        await tx.patientProfile.upsert({
          where: { userId },
          create: { userId, phone },
          update: { phone },
        })
      }

      await recordAdminAudit(tx, {
        actorId: actor.id,
        targetUserId: userId,
        action: "USER_UPDATED",
        before,
        after: userSnapshot(user),
        metadata: { sessionsRevoked: status === "INACTIVE" },
      })

      return user
    })

    revalidateUserManagement(updated.id)
    return actionOk("Akun diperbarui.")
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Akun gagal diperbarui.")
  }
}

export async function resetAdminUserPassword(formData: FormData): Promise<AdminUserActionResult> {
  const actor = await requireRole("ADMIN")

  try {
    const userId = requireField(formData, "userId", "User")
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true },
    })
    if (!target) return actionError("User tidak ditemukan.")

    const temporaryPassword = generateTemporaryPassword()

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await upsertCredentialPassword(tx, userId, temporaryPassword)
      await tx.session.deleteMany({ where: { userId } })
      await recordAdminAudit(tx, {
        actorId: actor.id,
        targetUserId: userId,
        action: "PASSWORD_RESET",
        before: userSnapshot(target),
        after: userSnapshot(target),
        metadata: { sessionsRevoked: true },
      })
    })

    revalidateUserManagement(userId)
    return actionOk("Password sementara dibuat.", { temporaryPassword })
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Password gagal direset.")
  }
}

export async function revokeAdminUserSessions(formData: FormData): Promise<AdminUserActionResult> {
  const actor = await requireRole("ADMIN")

  try {
    const userId = requireField(formData, "userId", "User")
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true },
    })
    if (!target) return actionError("User tidak ditemukan.")

    const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const deleted = await tx.session.deleteMany({ where: { userId } })
      await recordAdminAudit(tx, {
        actorId: actor.id,
        targetUserId: userId,
        action: "SESSIONS_REVOKED",
        before: userSnapshot(target),
        after: userSnapshot(target),
        metadata: { revokedSessions: deleted.count },
      })
      return deleted
    })

    revalidateUserManagement(userId)
    return actionOk(`${result.count} sesi dicabut.`)
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Sesi gagal dicabut.")
  }
}

export async function updateAdminPatientProfile(formData: FormData): Promise<AdminUserActionResult> {
  const actor = await requireRole("ADMIN")

  try {
    const userId = requireField(formData, "userId", "User")
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { patientProfile: true },
    })
    if (!user) return actionError("User tidak ditemukan.")

    const before = profileSnapshot(user.patientProfile)
    const birthDate = parseDateField(value(formData, "birthDate"))
    const age = parseAge(value(formData, "age"))
    const genderRaw = value(formData, "gender")
    const gender = genderRaw === "MALE" || genderRaw === "FEMALE" ? genderRaw : null
    const phone = optionalField(formData, "patientPhone")
    const address = optionalField(formData, "address")

    const profile = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.patientProfile.upsert({
        where: { userId },
        create: { userId, birthDate, age, gender, phone, address },
        update: { birthDate, age, gender, phone, address },
      })
      await recordAdminAudit(tx, {
        actorId: actor.id,
        targetUserId: userId,
        action: "PATIENT_PROFILE_UPDATED",
        before,
        after: profileSnapshot(updated),
      })
      return updated
    })

    revalidateUserManagement(userId)
    return actionOk(profile ? "Profil pasien diperbarui." : "Profil pasien dibuat.")
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Profil pasien gagal diperbarui.")
  }
}

export async function updateAdminPharmacistProfile(formData: FormData): Promise<AdminUserActionResult> {
  const actor = await requireRole("ADMIN")

  try {
    const userId = requireField(formData, "userId", "User")
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { pharmacistProfile: true },
    })
    if (!user) return actionError("User tidak ditemukan.")

    const strNumber = requireField(formData, "strNumber", "Nomor STR")
    if (await duplicateStrNumber(strNumber, userId)) return actionError("Nomor STR sudah terdaftar.")

    const verificationStatusValue = parseOption(
      value(formData, "verificationStatus"),
      adminPharmacistStatuses
    )
    if (!verificationStatusValue || verificationStatusValue === "ALL") return actionError("Status verifikasi tidak valid.")
    const verificationStatus = verificationStatusValue as PharmacistVerificationStatusValue

    const adminNote = optionalField(formData, "adminNote")
    if (verificationStatus !== "VERIFIED" && !adminNote) {
      return actionError("Catatan admin wajib diisi untuk status ini.")
    }

    const before = profileSnapshot(user.pharmacistProfile)
    const availabilityStatus: PharmacistAvailabilityStatus =
      value(formData, "availabilityStatus") === "ONLINE" ? "ONLINE" : "OFFLINE"
    const profilePhotoUpload = await optionalFileDataUrl(
      formData,
      "profilePhoto",
      "Foto profil",
      ["image/png", "image/jpeg", "image/webp"]
    )
    if (!profilePhotoUpload.ok) return actionError(profilePhotoUpload.error)

    const strDocumentUpload = await optionalFileDataUrl(
      formData,
      "strDocument",
      "Dokumen STR",
      ["image/png", "image/jpeg", "image/webp", "application/pdf"]
    )
    if (!strDocumentUpload.ok) return actionError(strDocumentUpload.error)

    const profilePhotoUrl =
      profilePhotoUpload.url ??
      optionalField(formData, "profilePhotoUrl") ??
      user.pharmacistProfile?.profilePhotoUrl ??
      null
    const strDocumentUrl =
      strDocumentUpload.url ??
      optionalField(formData, "strDocumentUrl") ??
      user.pharmacistProfile?.strDocumentUrl ??
      null
    const data = {
      title: requireField(formData, "title", "Gelar"),
      strNumber,
      profilePhotoUrl,
      bio: requireField(formData, "bio", "Bio"),
      topics: splitTopics(requireField(formData, "topics", "Topik bantuan")),
      practiceLocation: requireField(formData, "practiceLocation", "Lokasi praktik"),
      serviceHours: requireField(formData, "serviceHours", "Jam layanan"),
      experienceSummary: requireField(formData, "experienceSummary", "Pengalaman"),
      strDocumentUrl,
      verificationStatus,
      availabilityStatus,
      adminNote: verificationStatus === "VERIFIED" ? null : adminNote,
    }

    await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.pharmacistProfile.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      })
      await tx.user.update({
        where: { id: userId },
        data: {
          role: "PHARMACIST",
          image: data.profilePhotoUrl ?? user.image,
        },
      })
      await recordAdminAudit(tx, {
        actorId: actor.id,
        targetUserId: userId,
        action: "PHARMACIST_PROFILE_UPDATED",
        before,
        after: profileSnapshot(updated),
        metadata: { roleSetToPharmacist: user.role !== "PHARMACIST" },
      })
    })

    revalidateUserManagement(userId)
    return actionOk("Profil apoteker diperbarui.")
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Profil apoteker gagal diperbarui.")
  }
}
