"use server"

import { upsertForumSubscription } from "@/lib/forum"
import { requireUser } from "@/lib/session"

export async function markForumThreadRead(threadId: string) {
  const user = await requireUser()
  await upsertForumSubscription(threadId, user.id)
  return { ok: true }
}
