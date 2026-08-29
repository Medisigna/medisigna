import {
  AccountStatus,
  PharmacistVerificationStatus,
  Prisma,
  UserRole,
} from "@prisma/client"

import { db } from "@/lib/db"

export const adminUserRoles = ["ALL", "PATIENT", "PHARMACIST", "ADMIN"] as const
export const adminAccountStatuses = ["ALL", "ACTIVE", "INACTIVE"] as const
export const adminPharmacistStatuses = [
  "ALL",
  "PENDING",
  "VERIFIED",
  "REJECTED",
  "NEEDS_REVISION",
] as const
export const adminUserSorts = ["newest", "oldest", "name", "role", "status"] as const

export type AdminUserRoleFilter = (typeof adminUserRoles)[number]
export type AdminAccountStatusFilter = (typeof adminAccountStatuses)[number]
export type AdminPharmacistStatusFilter = (typeof adminPharmacistStatuses)[number]
export type AdminUserSort = (typeof adminUserSorts)[number]
export type UserRoleValue = Exclude<AdminUserRoleFilter, "ALL">
export type AccountStatusValue = Exclude<AdminAccountStatusFilter, "ALL">
export type PharmacistVerificationStatusValue = Exclude<AdminPharmacistStatusFilter, "ALL">

export type AdminUserListParams = {
  query?: string
  role?: AdminUserRoleFilter
  status?: AdminAccountStatusFilter
  pharmacistStatus?: AdminPharmacistStatusFilter
  sort?: AdminUserSort
  page?: number
}

export type AdminUserListItem = {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  role: string
  status: string
  createdAt: Date
  updatedAt: Date
  patientProfile: unknown | null
  pharmacistProfile: {
    verificationStatus: string
  } | null
  _count: {
    sessions: number
    patientSessions: number
    pharmacistSessions: number
    authoredArticles: number
    authoredVideos: number
    forumThreads: number
    forumPosts: number
  }
}

export type AdminUserDetail = Awaited<ReturnType<typeof getAdminUserDetail>>

export const adminRoleLabels: Record<UserRoleValue, string> = {
  PATIENT: "Pasien",
  PHARMACIST: "Apoteker",
  ADMIN: "Admin",
}

export const adminAccountStatusLabels: Record<AccountStatusValue, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
}

export const adminPharmacistStatusLabels: Record<PharmacistVerificationStatusValue, string> = {
  PENDING: "Menunggu",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  NEEDS_REVISION: "Perlu Revisi",
}

export const adminUserActionLabels: Record<string, string> = {
  USER_CREATED: "User dibuat",
  USER_UPDATED: "Akun diperbarui",
  USER_UPDATE_REJECTED: "Perubahan ditolak",
  PASSWORD_RESET: "Password direset",
  SESSIONS_REVOKED: "Sesi dicabut",
  PATIENT_PROFILE_UPDATED: "Profil pasien diperbarui",
  PHARMACIST_PROFILE_UPDATED: "Profil apoteker diperbarui",
}

const pageSize = 12

function parseOption<T extends readonly string[]>(value: unknown, options: T, fallback: T[number]): T[number] {
  return typeof value === "string" && (options as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback
}

export function parseAdminUserListParams(params?: Record<string, string | string[] | undefined>): Required<AdminUserListParams> {
  const rawPage = typeof params?.page === "string" ? Number(params.page) : 1

  return {
    query: typeof params?.q === "string" ? params.q.trim() : "",
    role: parseOption(params?.role, adminUserRoles, "ALL"),
    status: parseOption(params?.status, adminAccountStatuses, "ALL"),
    pharmacistStatus: parseOption(params?.pharmacistStatus, adminPharmacistStatuses, "ALL"),
    sort: parseOption(params?.sort, adminUserSorts, "newest"),
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
  }
}

export function adminUsersHref(params: AdminUserListParams = {}) {
  const query = new URLSearchParams()
  if (params.query) query.set("q", params.query)
  if (params.role && params.role !== "ALL") query.set("role", params.role)
  if (params.status && params.status !== "ALL") query.set("status", params.status)
  if (params.pharmacistStatus && params.pharmacistStatus !== "ALL") {
    query.set("pharmacistStatus", params.pharmacistStatus)
  }
  if (params.sort && params.sort !== "newest") query.set("sort", params.sort)
  if (params.page && params.page > 1) query.set("page", String(params.page))
  return query.size ? `/admin/users?${query.toString()}` : "/admin/users"
}

function userWhere(params: ReturnType<typeof parseAdminUserListParams>): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {}

  if (params.role !== "ALL") {
    where.role = params.role as UserRole
  }

  if (params.status !== "ALL") {
    where.status = params.status as AccountStatus
  }

  if (params.pharmacistStatus !== "ALL") {
    where.pharmacistProfile = {
      is: {
        verificationStatus: params.pharmacistStatus as PharmacistVerificationStatus,
      },
    }
  }

  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: "insensitive" } },
      { email: { contains: params.query, mode: "insensitive" } },
      { phone: { contains: params.query, mode: "insensitive" } },
    ]
  }

  return where
}

function userOrderBy(sort: AdminUserSort): Prisma.UserOrderByWithRelationInput[] {
  if (sort === "oldest") return [{ createdAt: "asc" }]
  if (sort === "name") return [{ name: "asc" }, { createdAt: "desc" }]
  if (sort === "role") return [{ role: "asc" }, { createdAt: "desc" }]
  if (sort === "status") return [{ status: "asc" }, { createdAt: "desc" }]
  return [{ createdAt: "desc" }]
}

export async function getAdminUsers(params: ReturnType<typeof parseAdminUserListParams>) {
  const where = userWhere(params)
  const skip = (params.page - 1) * pageSize

  const [users, total, stats] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        patientProfile: true,
        pharmacistProfile: true,
        _count: {
          select: {
            sessions: true,
            patientSessions: true,
            pharmacistSessions: true,
            authoredArticles: true,
            authoredVideos: true,
            forumThreads: true,
            forumPosts: true,
          },
        },
      },
      orderBy: userOrderBy(params.sort),
      skip,
      take: pageSize,
    }),
    db.user.count({ where }),
    getAdminUserStats(),
  ]) as [AdminUserListItem[], number, Awaited<ReturnType<typeof getAdminUserStats>>]

  return {
    users,
    total,
    stats,
    page: params.page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getAdminUserStats() {
  const [
    total,
    active,
    inactive,
    patients,
    pharmacists,
    admins,
    pendingPharmacists,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { status: "INACTIVE" } }),
    db.user.count({ where: { role: "PATIENT" } }),
    db.user.count({ where: { role: "PHARMACIST" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.pharmacistProfile.count({ where: { verificationStatus: "PENDING" } }),
  ])

  return {
    total,
    active,
    inactive,
    patients,
    pharmacists,
    admins,
    pendingPharmacists,
  }
}

export type AdminAuditLogItem = {
  id: string
  action: string
  before: unknown
  after: unknown
  metadata: unknown
  createdAt: Date
  actor: {
    name: string
    email: string
  } | null
}

export async function getAdminAuditLogs(targetUserId: string, limit = 20): Promise<AdminAuditLogItem[]> {
  return db.$queryRaw<AdminAuditLogItem[]>`
    SELECT
      log.id,
      log.action,
      log.before,
      log.after,
      log.metadata,
      log."createdAt",
      jsonb_build_object('name', actor.name, 'email', actor.email) AS actor
    FROM "AdminAuditLog" log
    LEFT JOIN "user" actor ON actor.id = log."actorId"
    WHERE log."targetUserId" = ${targetUserId}
    ORDER BY log."createdAt" DESC
    LIMIT ${limit}
  `
}

export async function getAdminUserDetail(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      patientProfile: true,
      pharmacistProfile: true,
      _count: {
        select: {
          sessions: true,
          patientSessions: true,
          pharmacistSessions: true,
          sentMessages: true,
          reviewedDrugs: true,
          authoredArticles: true,
          authoredVideos: true,
          forumThreads: true,
          forumPosts: true,
          forumPostLikes: true,
          forumReports: true,
          fcmTokens: true,
          notifications: true,
        },
      },
    },
  })

  if (!user) return null

  const auditLogs = await getAdminAuditLogs(id)
  return { user, auditLogs }
}
