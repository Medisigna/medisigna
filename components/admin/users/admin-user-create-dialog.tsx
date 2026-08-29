"use client"

import Link from "next/link"
import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CopyIcon, PlusIcon, UserPlusIcon } from "lucide-react"
import toast from "react-hot-toast"

import { createAdminUser } from "@/app/actions/admin/manage-user"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type CreateResult = {
  userId?: string
  temporaryPassword?: string
}

const fieldClassName = "bg-card shadow-none"
const selectClassName = "h-9 rounded-md border border-input bg-card px-2.5 text-sm shadow-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function TemporaryPasswordPanel({ result }: { result: CreateResult }) {
  if (!result.temporaryPassword) return null

  async function copyPassword() {
    await navigator.clipboard.writeText(result.temporaryPassword ?? "")
    toast.success("Password disalin.")
  }

  return (
    <div className="rounded-xl bg-secondary p-3">
      <p className="text-sm font-medium">Password sementara</p>
      <div className="mt-2 flex min-w-0 items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-md bg-card px-2.5 py-2 text-sm">
          {result.temporaryPassword}
        </code>
        <Button type="button" variant="outline" size="icon-sm" aria-label="Salin password" onClick={copyPassword}>
          <CopyIcon />
        </Button>
      </div>
      {result.userId ? (
        <Button asChild variant="link" className="mt-2 h-auto px-0">
          <Link href={`/admin/users/${result.userId}`}>Buka detail user</Link>
        </Button>
      ) : null}
    </div>
  )
}

export function AdminUserCreateDialog() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState("PATIENT")
  const [result, setResult] = useState<CreateResult>({})
  const [isPending, startTransition] = useTransition()

  function submit(formData: FormData) {
    startTransition(async () => {
      const actionResult = await createAdminUser(formData)

      if (!actionResult.ok) {
        toast.error(actionResult.error)
        return
      }

      toast.success(actionResult.message)
      setResult({
        userId: actionResult.userId,
        temporaryPassword: actionResult.temporaryPassword,
      })
      formRef.current?.reset()
      setRole("PATIENT")
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlusIcon data-icon="inline-start" />
          Tambah User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tambah User</DialogTitle>
          <DialogDescription>Buat akun pasien, apoteker, atau admin.</DialogDescription>
        </DialogHeader>
        <TemporaryPasswordPanel result={result} />
        <form ref={formRef} action={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Nama
              <Input name="name" required className={fieldClassName} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <Input name="email" type="email" required className={fieldClassName} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              WhatsApp
              <Input name="phone" className={fieldClassName} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Role
              <select
                name="role"
                className={selectClassName}
                defaultValue="PATIENT"
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="PATIENT">Pasien</option>
                <option value="PHARMACIST">Apoteker</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Status
              <select name="status" className={selectClassName} defaultValue="ACTIVE">
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </label>
          </div>

          {role === "PHARMACIST" ? (
            <div className="grid gap-4 rounded-xl bg-secondary p-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Gelar
                <Input name="title" required className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Nomor STR
                <Input name="strNumber" required className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Status verifikasi
                <select name="verificationStatus" className={selectClassName} defaultValue="VERIFIED">
                  <option value="VERIFIED">Terverifikasi</option>
                  <option value="PENDING">Menunggu</option>
                  <option value="NEEDS_REVISION">Perlu Revisi</option>
                  <option value="REJECTED">Ditolak</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Foto profil URL
                <Input name="profilePhotoUrl" className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                Dokumen STR URL
                <Input name="strDocumentUrl" className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                Bio
                <Textarea name="bio" required className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                Topik bantuan
                <Input name="topics" required className={fieldClassName} placeholder="Obat bebas, resep, efek samping" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Lokasi praktik
                <Input name="practiceLocation" required className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Jam layanan
                <Input name="serviceHours" required className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                Pengalaman
                <Textarea name="experienceSummary" required className={fieldClassName} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                Catatan admin
                <Textarea name="adminNote" className={fieldClassName} />
              </label>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              <PlusIcon data-icon="inline-start" />
              {isPending ? "Membuat..." : "Buat User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
