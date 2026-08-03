"use client"

import { useId, useState, useTransition } from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import toast from "react-hot-toast"

import { deleteForumReply, updateForumReply } from "@/app/actions/forum/manage-reply"
import { ForumReplyAttachmentField } from "@/components/forum/forum-reply-attachment-field"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type ForumActionResult = {
  ok: boolean
  error?: string
}

export function ForumReplyOwnerActions({
  bodyMarkdown,
  postId,
}: {
  bodyMarkdown: string
  postId: string
}) {
  const editId = useId()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [attachmentKey, setAttachmentKey] = useState(0)
  const [isPending, startTransition] = useTransition()

  function submitEdit(formData: FormData) {
    startTransition(async () => {
      const result = (await updateForumReply(formData)) as ForumActionResult
      if (!result.ok) {
        toast.error(result.error ?? "Balasan gagal diperbarui.")
        return
      }

      toast.success("Balasan diperbarui.")
      setEditOpen(false)
      setAttachmentKey((key) => key + 1)
    })
  }

  function submitDelete() {
    const formData = new FormData()
    formData.set("postId", postId)

    startTransition(async () => {
      const result = (await deleteForumReply(formData)) as ForumActionResult
      if (!result.ok) {
        toast.error(result.error ?? "Balasan gagal dihapus.")
        return
      }

      toast.success("Balasan dihapus.")
    })
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Opsi balasan">
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault()
                setEditOpen(true)
              }}
            >
              <PencilIcon data-icon="inline-start" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault()
                setDeleteOpen(true)
              }}
            >
              <Trash2Icon data-icon="inline-start" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit balasan</DialogTitle>
          </DialogHeader>
          <form action={submitEdit} className="flex flex-col gap-4">
            <input type="hidden" name="postId" value={postId} />
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor={editId}>
              Balasan
              <Textarea
                id={editId}
                name="bodyMarkdown"
                defaultValue={bodyMarkdown}
                rows={5}
                className="resize-none"
              />
            </label>
            <ForumReplyAttachmentField key={attachmentKey} disabled={isPending} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus balasan?</AlertDialogTitle>
            <AlertDialogDescription>
              Balasan ini akan dihapus dari diskusi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={submitDelete} disabled={isPending}>
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
