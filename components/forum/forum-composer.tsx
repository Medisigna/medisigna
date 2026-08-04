"use client"

import Link from "next/link"
import { useId, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, MessageSquarePlusIcon, SendIcon } from "lucide-react"
import toast from "react-hot-toast"

import { createForumThread } from "@/app/actions/forum/create-thread"
import { replyForumThread } from "@/app/actions/forum/reply-thread"
import { updateForumThread } from "@/app/actions/forum/update-thread"
import { ForumReplyAttachmentField } from "@/components/forum/forum-reply-attachment-field"
import { ForumRichEditorField } from "@/components/forum/forum-rich-editor-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ForumCategoryItem, ForumThreadDetail } from "@/lib/forum"

type ForumActionResult = {
  ok: boolean
  error?: string
  href?: string
}

export function ForumThreadComposer({
  href,
  disabled,
  disabledMessage,
}: {
  href: string
  disabled?: boolean
  disabledMessage?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      {disabled ? (
        <Button disabled className="w-fit">
          <MessageSquarePlusIcon data-icon="inline-start" />
          Buat diskusi
        </Button>
      ) : (
        <Button asChild className="w-fit">
          <Link href={href}>
            <MessageSquarePlusIcon data-icon="inline-start" />
            Buat diskusi
          </Link>
        </Button>
      )}
      {disabled ? (
        <p className="text-sm text-muted-foreground">
          {disabledMessage ?? "Akun belum bisa membuat diskusi."}
        </p>
      ) : null}
    </div>
  )
}

export function ForumThreadCreateForm({
  basePath,
  categories,
}: {
  basePath: string
  categories: ForumCategoryItem[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = (await createForumThread(formData)) as ForumActionResult
      if (!result.ok) {
        toast.error(result.error ?? "Diskusi gagal dibuat.")
        return
      }

      toast.success("Diskusi dibuat.")
      if (result.href) router.push(result.href)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Button asChild variant="ghost" className="w-fit">
        <Link href={basePath}>
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Buat diskusi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Judul
              <Input name="title" maxLength={140} required aria-required />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Kategori
              <select
                name="categoryId"
                required
                aria-required
                className="h-10 rounded-md border bg-background px-3 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Pilih kategori
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <ForumRichEditorField name="bodyMarkdown" label="Isi diskusi" required height={260} />
            <div className="flex justify-end gap-2">
              <Button asChild variant="outline">
                <Link href={basePath}>
                Batal
                </Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                <SendIcon data-icon="inline-start" />
                {isPending ? "Mengirim..." : "Buat diskusi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function ForumThreadEditForm({
  basePath,
  categories,
  thread,
}: {
  basePath: string
  categories: ForumCategoryItem[]
  thread: ForumThreadDetail
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const firstPost = thread.posts[0]

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = (await updateForumThread(formData)) as ForumActionResult
      if (!result.ok) {
        toast.error(result.error ?? "Diskusi gagal diperbarui.")
        return
      }

      toast.success("Diskusi diperbarui.")
      if (result.href) router.push(result.href)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Button asChild variant="ghost" className="w-fit">
        <Link href={`${basePath}/${thread.slug}`}>
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit diskusi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submit} className="flex flex-col gap-5">
            <input type="hidden" name="threadId" value={thread.id} />
            <label className="flex flex-col gap-2 text-sm font-medium">
              Judul
              <Input name="title" maxLength={140} required aria-required defaultValue={thread.title} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Kategori
              <select
                name="categoryId"
                required
                aria-required
                className="h-10 rounded-md border bg-background px-3 text-sm"
                defaultValue={categories.find((category) => category.slug === thread.categorySlug)?.id ?? ""}
              >
                <option value="" disabled>
                  Pilih kategori
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <ForumRichEditorField
              name="bodyMarkdown"
              label="Isi diskusi"
              defaultValue={firstPost?.bodyMarkdown}
              required
              height={260}
            />
            <div className="flex justify-end gap-2">
              <Button asChild variant="outline">
                <Link href={`${basePath}/${thread.slug}`}>Batal</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                <SendIcon data-icon="inline-start" />
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function ForumReplyComposer({
  compact = false,
  disabled,
  disabledMessage,
  inline = false,
  loginHref,
  onCancel,
  parentPostId,
  replyToName,
  threadId,
}: {
  compact?: boolean
  disabled?: boolean
  disabledMessage?: string
  inline?: boolean
  loginHref?: string
  onCancel?: () => void
  parentPostId?: string
  replyToName?: string
  threadId: string
}) {
  const router = useRouter()
  const replyId = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [attachmentKey, setAttachmentKey] = useState(0)
  const [isPending, startTransition] = useTransition()
  const wrapperClass = compact
    ? "pt-3"
    : inline
      ? "p-5 sm:p-6"
      : "rounded-xl bg-background p-4 shadow-sm ring-1 ring-border/70"

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = (await replyForumThread(formData)) as ForumActionResult
      if (!result.ok) {
        toast.error(result.error ?? "Balasan gagal dikirim.")
        return
      }

      toast.success("Balasan dikirim.")
      formRef.current?.reset()
      setAttachmentKey((key) => key + 1)
      router.refresh()
    })
  }

  if (disabled && loginHref) {
    return (
      <div className={wrapperClass}>
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-secondary p-4">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-foreground">Balas diskusi</p>
            <p className="text-sm text-muted-foreground">
              {disabledMessage ?? "Masuk untuk membalas forum."}
            </p>
          </div>
          <Button asChild>
            <Link href={loginHref}>Masuk untuk Membalas</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      <div className="flex flex-col gap-3">
        {compact ? null : (
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-foreground">Balas diskusi</p>
            <p className="text-sm text-muted-foreground">
              {disabled
                ? disabledMessage ?? "Diskusi tidak menerima balasan baru."
                : "Tambahkan balasan untuk thread ini."}
            </p>
          </div>
        )}
        <form
          ref={formRef}
          action={submit}
          className="rounded-2xl border bg-background p-3 shadow-xs focus-within:ring-3 focus-within:ring-ring/40"
        >
          <input type="hidden" name="threadId" value={threadId} />
          {parentPostId ? <input type="hidden" name="parentPostId" value={parentPostId} /> : null}
          <label className="sr-only" htmlFor={replyId}>
            Balasan
          </label>
          <Textarea
            id={replyId}
            name="bodyMarkdown"
            disabled={disabled}
            rows={compact ? 2 : 3}
            placeholder={replyToName ? `Balas ${replyToName}...` : "Tulis komentar..."}
            className="min-h-16 resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
          />
          <ForumReplyAttachmentField key={attachmentKey} disabled={disabled || isPending} />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={disabled || isPending}
              onClick={() => {
                formRef.current?.reset()
                setAttachmentKey((key) => key + 1)
                onCancel?.()
              }}
            >
              Batal
            </Button>
            <Button type="submit" disabled={disabled || isPending}>
              <SendIcon data-icon="inline-start" />
              {isPending ? "Mengirim..." : "Komentar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
