import { notFound } from "next/navigation"

import { ForumThreadCreateForm } from "@/components/forum/forum-composer"
import { canWriteForum, getForumCategories } from "@/lib/forum"
import { requireRole } from "@/lib/session"

export const metadata = {
  title: "Buat Diskusi | Forum Medisigna",
}

export default async function PharmacistForumNewPage() {
  const [user, categories] = await Promise.all([
    requireRole("PHARMACIST"),
    getForumCategories(),
  ])

  if (!canWriteForum(user)) notFound()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4 md:py-6">
      <ForumThreadCreateForm basePath="/pharmacist/dashboard/forum" categories={categories} />
    </main>
  )
}
