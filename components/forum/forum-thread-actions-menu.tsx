"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { FlagIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { deleteForumThread } from "@/app/actions/forum/update-thread"
import { ForumReportDialog } from "@/components/forum/forum-report-dialog"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ForumThreadActionsMenu({
  canEdit,
  canReport,
  editHref,
  targetId,
}: {
  canEdit: boolean
  canReport: boolean
  editHref: string
  targetId: string
}) {
  const router = useRouter()
  const [reportOpen, setReportOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!canEdit && !canReport) return null

  function submitDelete() {
    const formData = new FormData()
    formData.set("threadId", targetId)

    startTransition(async () => {
      const result = await deleteForumThread(formData)
      if (!result.ok) {
        toast.error(result.error ?? "Diskusi gagal dihapus.")
        return
      }

      toast.success("Diskusi dihapus.")
      if (result.href) router.push(result.href)
      router.refresh()
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Opsi diskusi">
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            {canEdit ? (
              <DropdownMenuItem asChild>
                <Link href={editHref}>
                  <PencilIcon data-icon="inline-start" />
                  Edit postingan
                </Link>
              </DropdownMenuItem>
            ) : null}
            {canEdit ? (
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault()
                  setDeleteOpen(true)
                }}
              >
                <Trash2Icon data-icon="inline-start" />
                Hapus postingan
              </DropdownMenuItem>
            ) : null}
            {canEdit && canReport ? <DropdownMenuSeparator /> : null}
            {canReport ? (
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault()
                  setReportOpen(true)
                }}
              >
                <FlagIcon data-icon="inline-start" />
                Laporkan
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ForumReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="THREAD"
        targetId={targetId}
        trigger={null}
      />
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus postingan?</AlertDialogTitle>
            <AlertDialogDescription>
              Diskusi dan semua komentar di dalamnya akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={submitDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
