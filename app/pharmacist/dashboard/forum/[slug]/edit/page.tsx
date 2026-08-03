import { notFound } from "next/navigation"

import { ForumThreadEditForm } from "@/components/forum/forum-composer"
import { canWriteForum, getForumCategories, getForumThreadBySlug } from "@/lib/forum"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const thread = await getForumThreadBySlug({ slug })

  return {
    title: thread ? `Edit ${thread.title} | Forum Medisigna` : "Edit Forum Medisigna",
  }
}

export default async function PharmacistForumThreadEditPage({ params }: PageProps) {
  const [user, { slug }, categories] = await Promise.all([
    requireRole("PHARMACIST"),
    params,
    getForumCategories(),
  ])
  const thread = await getForumThreadBySlug({ slug, userId: user.id })

  if (!thread) notFound()
  if (!canWriteForum(user) || thread.authorId !== user.id) notFound()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <ForumThreadEditForm
        basePath="/pharmacist/dashboard/forum"
        categories={categories}
        thread={thread}
      />
    </main>
  )
}
