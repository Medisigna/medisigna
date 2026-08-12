import { ForumThreadComposer } from "@/components/forum/forum-composer"
import { ForumThreadList } from "@/components/forum/forum-thread-list"
import {
  getForumCategories,
  getForumThreads,
  getForumUnreadCount,
} from "@/lib/forum"
import { requireRole } from "@/lib/session"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = {
  title: "Forum Diskusi | Medisigna",
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function PatientForumPage({ searchParams }: PageProps) {
  const emptyParams: Record<string, string | string[] | undefined> = {}
  const [user, params, categories] = await Promise.all([
    requireRole("PATIENT"),
    searchParams ?? Promise.resolve(emptyParams),
    getForumCategories(),
  ])
  const category = param(params.category)
  const query = param(params.q)
  const [{ threads, total }, unreadTotal] = await Promise.all([
    getForumThreads({ category, query, userId: user.id }),
    getForumUnreadCount(user.id),
  ])

  return (
    <main className="min-h-[calc(100dvh-7rem)] rounded-[2rem] bg-secondary py-4 md:rounded-[2.25rem] md:py-6">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4">
        <ForumThreadComposer href="/dashboard/forum/new" />
        <ForumThreadList
          basePath="/dashboard/forum"
          categories={categories}
          category={category}
          query={query}
          threads={threads}
          total={total}
          unreadTotal={unreadTotal}
          variant="soft"
        />
      </div>
    </main>
  )
}
