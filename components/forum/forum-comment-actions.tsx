"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquareTextIcon } from "lucide-react"

import { ForumReplyComposer } from "@/components/forum/forum-composer"
import { ForumShareDialog } from "@/components/forum/forum-share-dialog"
import { Button } from "@/components/ui/button"

export function ForumCommentActions({
  canReply,
  disabledMessage,
  loginHref,
  parentPostId,
  replyCount,
  replyToName,
  shareHref,
  shareTitle,
  threadId,
}: {
  canReply: boolean
  disabledMessage?: string
  loginHref?: string
  parentPostId: string
  replyCount: number
  replyToName: string
  shareHref: string
  shareTitle: string
  threadId: string
}) {
  const [replyOpen, setReplyOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button
          type={loginHref && !canReply ? undefined : "button"}
          asChild={loginHref && !canReply ? true : undefined}
          variant="ghost"
          size="sm"
          disabled={!canReply && !loginHref}
          aria-label={`Balas ${replyToName}`}
          onClick={
            loginHref && !canReply
              ? undefined
              : () => setReplyOpen((open) => !open)
          }
        >
          {loginHref && !canReply ? (
            <Link href={loginHref}>
              <MessageSquareTextIcon aria-hidden="true" />
              <span className="text-xs font-medium">{replyCount}</span>
            </Link>
          ) : (
            <>
              <MessageSquareTextIcon aria-hidden="true" />
              <span className="text-xs font-medium">{replyCount}</span>
            </>
          )}
        </Button>
        <ForumShareDialog href={shareHref} title={shareTitle} label="Share" />
      </div>
      {replyOpen ? (
        <ForumReplyComposer
          compact
          threadId={threadId}
          parentPostId={parentPostId}
          disabled={!canReply}
          disabledMessage={disabledMessage}
          onCancel={() => setReplyOpen(false)}
          replyToName={replyToName}
        />
      ) : null}
    </div>
  )
}
