"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { HeartIcon } from "lucide-react"
import toast from "react-hot-toast"

import { toggleForumPostLike } from "@/app/actions/forum/toggle-like"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ForumLikeButtonProps = {
  className?: string
  initialLiked: boolean
  likeCount: number
  loginHref?: string
  postId: string
}

export function ForumLikeButton({
  className,
  initialLiked,
  likeCount,
  loginHref,
  postId,
}: ForumLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(likeCount)
  const [isPending, startTransition] = useTransition()

  if (loginHref) {
    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn("text-muted-foreground", className)}
        aria-label="Masuk untuk menyukai forum"
      >
        <Link href={loginHref}>
          <HeartIcon aria-hidden="true" />
          <span className="text-xs font-medium">{count}</span>
        </Link>
      </Button>
    )
  }

  function toggleLike() {
    const nextLiked = !liked
    const nextCount = Math.max(count + (nextLiked ? 1 : -1), 0)
    const previousLiked = liked
    const previousCount = count

    setLiked(nextLiked)
    setCount(nextCount)

    startTransition(async () => {
      const result = await toggleForumPostLike(postId)

      if (result.ok !== true) {
        setLiked(previousLiked)
        setCount(previousCount)
        toast.error(result.error ?? "Suka gagal diperbarui.")
        return
      }

      setLiked(result.liked)
      setCount(result.likeCount)
      toast.success(result.liked ? "Disukai." : "Suka dibatalkan.")
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "text-muted-foreground",
        liked && "text-primary hover:text-primary",
        className
      )}
      disabled={isPending}
      aria-label={liked ? "Batalkan suka forum" : "Sukai forum"}
      aria-pressed={liked}
      onClick={toggleLike}
    >
      <HeartIcon
        aria-hidden="true"
        className={cn(liked && "fill-current")}
      />
      <span className="text-xs font-medium">{count}</span>
    </Button>
  )
}
