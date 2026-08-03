import { notFound } from "next/navigation"

import { ForumThreadDetailView } from "@/components/forum/forum-thread-detail"
import { canWriteForum, getForumThreadBySlug } from "@/lib/forum"
import { requireRole } from "@/lib/session"

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const thread = await getForumThreadBySlug({ slug })

  return {
    title: thread ? `${thread.title} | Forum Medisigna` : "Forum Medisigna",
  }
}

export default async function PharmacistForumThreadPage({ params }: PageProps) {
  const [user, { slug }] = await Promise.all([requireRole("PHARMACIST"), params])
  const thread = await getForumThreadBySlug({ slug, userId: user.id })

  if (!thread) notFound()

  const canWrite = canWriteForum(user)
  const canReply = canWrite && thread.status === "ACTIVE"

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 md:px-6 md:py-8">
      <ForumThreadDetailView
        basePath="/pharmacist/dashboard/forum"
        canReport={canWrite}
        canReply={canReply}
        currentUserId={user.id}
        replyDisabledMessage={
          thread.status === "LOCKED"
            ? "Diskusi ini sudah dikunci admin."
            : "Akun apoteker harus terverifikasi untuk membalas forum."
        }
        thread={thread}
      />
    </main>
  )
}
