import { ForumThreadCreateForm } from "@/components/forum/forum-composer"
import { getForumCategories } from "@/lib/forum"
import { requireRole } from "@/lib/session"

export const metadata = {
  title: "Buat Diskusi | Forum Medisigna",
}

export default async function PatientForumNewPage() {
  const [_, categories] = await Promise.all([requireRole("PATIENT"), getForumCategories()])

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-5 md:py-8">
      <ForumThreadCreateForm basePath="/dashboard/forum" categories={categories} />
    </main>
  )
}
