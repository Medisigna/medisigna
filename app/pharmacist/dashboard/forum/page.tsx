import { ForumThreadComposer } from "@/components/forum/forum-composer"
import { ForumThreadList } from "@/components/forum/forum-thread-list"
import {
  canWriteForum,
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

export default async function PharmacistForumPage({ searchParams }: PageProps) {
  const emptyParams: Record<string, string | string[] | undefined> = {}
  const [user, params, categories] = await Promise.all([
    requireRole("PHARMACIST"),
    searchParams ?? Promise.resolve(emptyParams),
    getForumCategories(),
  ])
  const category = param(params.category)
  const query = param(params.q)
  const [{ threads, total }, unreadTotal] = await Promise.all([
    getForumThreads({ category, query, userId: user.id }),
    getForumUnreadCount(user.id),
  ])
  const canWrite = canWriteForum(user)

  return (
    <main className="mx-auto flex w-full max-w-[640px] flex-col gap-4 py-4 md:py-6">
      <ForumThreadComposer
        href="/pharmacist/dashboard/forum/new"
        disabled={!canWrite}
        disabledMessage="Akun apoteker harus terverifikasi untuk membuat diskusi."
      />
      <ForumThreadList
        basePath="/pharmacist/dashboard/forum"
        categories={categories}
        category={category}
        query={query}
        threads={threads}
        total={total}
        unreadTotal={unreadTotal}
        variant="soft"
      />
    </main>
  )
}
