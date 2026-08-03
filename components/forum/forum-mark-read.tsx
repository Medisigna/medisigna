"use client"

import { useEffect } from "react"

import { markForumThreadRead } from "@/app/actions/forum/mark-read"

export function ForumMarkRead({ threadId }: { threadId: string }) {
  useEffect(() => {
    markForumThreadRead(threadId).catch(() => {})
  }, [threadId])

  return null
}
