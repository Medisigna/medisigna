import { notFound } from "next/navigation"

import { ForumThreadDetailView } from "@/components/forum/forum-thread-detail"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import { canWriteForum, getForumThreadBySlug } from "@/lib/forum"
import { getCurrentUser } from "@/lib/session"

type PageProps = {
  params: Promise<{ slug: string }>
}

function loginHref(path: string) {
  return `/login?callbackUrl=${encodeURIComponent(path)}`
}

function forumBasePath(role?: string) {
  return role === "PHARMACIST" ? "/pharmacist/dashboard/forum" : "/dashboard/forum"
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const thread = await getForumThreadBySlug({ slug })

  return {
    title: thread ? `${thread.title} | Forum Medisigna` : "Forum Medisigna",
  }
}

export default async function PublicForumThreadPage({ params }: PageProps) {
  const [currentUser, { slug }] = await Promise.all([getCurrentUser(), params])
  const user = currentUser?.status === "ACTIVE" ? currentUser : null
  const thread = await getForumThreadBySlug({ slug, userId: user?.id })

  if (!thread) notFound()

  const canWrite = user ? canWriteForum(user) : false
  const canReply = canWrite && thread.status === "ACTIVE"
  const guestLoginHref =
    !user && thread.status === "ACTIVE"
      ? loginHref(`/forum/${thread.slug}`)
      : undefined

  return (
    <main className="flex min-h-svh flex-col bg-secondary">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
        <ForumThreadDetailView
          basePath="/forum"
          canReport={canWrite}
          canReply={canReply}
          currentUserId={user?.id}
          editBasePath={forumBasePath(user?.role)}
          loginHref={guestLoginHref}
          replyDisabledMessage={
            thread.status === "LOCKED"
              ? "Diskusi ini sudah dikunci admin."
              : user
                ? "Akun belum bisa membalas forum."
                : "Masuk untuk membalas forum."
          }
          thread={thread}
        />
      </div>
      <SiteFooter />
    </main>
  )
}
