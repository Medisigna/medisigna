import { ForumThreadComposer } from "@/components/forum/forum-composer"
import { ForumThreadList } from "@/components/forum/forum-thread-list"
import { SiteFooter } from "@/components/landing/site-footer"
import { SiteHeader } from "@/components/landing/site-header"
import {
  canWriteForum,
  getForumCategories,
  getForumThreads,
  getForumUnreadCount,
} from "@/lib/forum"
import { getCurrentUser } from "@/lib/session"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Forum Diskusi | Medisigna",
  description: "Ruang tanya jawab dan diskusi obat bersama komunitas Medisigna.",
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function PublicForumPage({ searchParams }: PageProps) {
  const emptyParams: Record<string, string | string[] | undefined> = {}
  const [currentUser, params, categories] = await Promise.all([
    getCurrentUser(),
    searchParams ?? Promise.resolve(emptyParams),
    getForumCategories(),
  ])
  const user = currentUser?.status === "ACTIVE" ? currentUser : null
  const category = param(params.category)
  const query = param(params.q)
  const [{ threads, total }, unreadTotal] = await Promise.all([
    getForumThreads({ category, query, userId: user?.id }),
    user ? getForumUnreadCount(user.id) : Promise.resolve(0),
  ])
  const canWrite = user ? canWriteForum(user) : false

  return (
    <main className="flex min-h-svh flex-col bg-secondary">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 px-4 py-8 sm:px-6 md:py-12">
        <ForumThreadComposer
          href="/forum/new"
          disabled={Boolean(user) && !canWrite}
          disabledMessage="Akun belum bisa membuat diskusi."
        />
        <ForumThreadList
          basePath="/forum"
          categories={categories}
          category={category}
          currentUserId={user?.id}
          query={query}
          threads={threads}
          total={total}
          unreadTotal={unreadTotal}
          variant="soft"
        />
      </div>
      <SiteFooter />
    </main>
  )
}
