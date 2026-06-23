import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export type AppRole = "PATIENT" | "PHARMACIST" | "ADMIN"

export function homeForRole(role: AppRole) {
  if (role === "ADMIN") return "/admin"
  if (role === "PHARMACIST") return "/pharmacist/dashboard"
  return "/dashboard"
}

export async function getCurrentUser() {
  const session = (await auth.api.getSession({
    headers: await headers(),
  })) as { user?: { id?: string } } | null

  if (!session?.user?.id) return null

  return db.user.findUnique({
    where: { id: session.user.id },
    include: {
      patientProfile: true,
      pharmacistProfile: true,
    },
  })
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user || user.status !== "ACTIVE") redirect("/login")

  return user
}

export async function requireRole(role: AppRole) {
  const user = await requireUser()

  if (user.role !== role) redirect(homeForRole(user.role))

  return user
}
