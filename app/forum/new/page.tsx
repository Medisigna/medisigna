import { redirect } from "next/navigation"

import { getCurrentUser, homeForRole } from "@/lib/session"

export const metadata = {
  title: "Buat Diskusi | Forum Medisigna",
}

export default async function PublicForumNewPage() {
  const user = await getCurrentUser()

  if (!user || user.status !== "ACTIVE") {
    redirect(`/login?callbackUrl=${encodeURIComponent("/forum/new")}`)
  }

  if (user.role === "PATIENT") redirect("/dashboard/forum/new")
  if (user.role === "PHARMACIST") redirect("/pharmacist/dashboard/forum/new")

  redirect(homeForRole(user.role))
}
