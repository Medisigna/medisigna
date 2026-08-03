"use client"

import { useState } from "react"
import { MessageSquareTextIcon } from "lucide-react"

import { ForumReplyComposer } from "@/components/forum/forum-composer"
import { ForumShareDialog } from "@/components/forum/forum-share-dialog"
import { Button } from "@/components/ui/button"

export function ForumCommentActions({
  canReply,
  disabledMessage,
  parentPostId,
  replyCount,
  replyToName,
  shareHref,
  shareTitle,
  threadId,
}: {
  canReply: boolean
  disabledMessage?: string
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
          type="button"
          variant="ghost"
          size="sm"
          disabled={!canReply}
          aria-label={`Balas ${replyToName}`}
          onClick={() => setReplyOpen((open) => !open)}
        >
          <MessageSquareTextIcon aria-hidden="true" />
          <span className="text-xs font-medium">{replyCount}</span>
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
