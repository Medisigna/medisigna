"use client"

import { ChangeEvent, useEffect, useId, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CopyIcon,
  FileTextIcon,
  ImageIcon,
  KeyRoundIcon,
  LogOutIcon,
  SaveIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react"
import toast from "react-hot-toast"

import {
  resetAdminUserPassword,
  revokeAdminUserSessions,
  updateAdminPatientProfile,
  updateAdminPharmacistProfile,
  updateAdminUser,
} from "@/app/actions/admin/manage-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ActionResult = {
  ok: boolean
  message?: string
  error?: string
  temporaryPassword?: string
}

type UserFormData = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  status: string
}

type PatientProfileData = {
  birthDate?: Date | string | null
  age?: number | null
  phone?: string | null
  gender?: string | null
  address?: string | null
} | null

type PharmacistProfileData = {
  title?: string | null
  strNumber?: string | null
  profilePhotoUrl?: string | null
  bio?: string | null
  topics?: string[]
  practiceLocation?: string | null
  serviceHours?: string | null
  experienceSummary?: string | null
  strDocumentUrl?: string | null
  verificationStatus?: string | null
  availabilityStatus?: string | null
  adminNote?: string | null
} | null

const fieldClassName = "bg-card shadow-none"
const selectClassName = "h-9 rounded-md border border-input bg-card px-2.5 text-sm shadow-none outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function dateValue(value?: Date | string | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

function useAdminAction() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function run(action: () => Promise<ActionResult>, after?: (result: ActionResult) => void) {
    startTransition(async () => {
      const result = await action()

      if (!result.ok) {
        toast.error(result.error ?? "Aksi gagal.")
        return
      }

      toast.success(result.message ?? "Perubahan tersimpan.")
      after?.(result)
      router.refresh()
    })
  }

  return { isPending, run }
}

function AdminAttachmentFileField({
  name,
  label,
  accept,
  description,
  currentUrl,
  imageOnly = false,
}: {
  name: string
  label: string
  accept: string
  description: string
  currentUrl?: string | null
  imageOnly?: boolean
}) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")
  const [isImage, setIsImage] = useState(false)
  const hasCurrentFile = Boolean(currentUrl)
  const mediaUrl = previewUrl || (imageOnly ? (currentUrl ?? "") : "")
  const mediaIsImage = Boolean(mediaUrl) && (isImage || imageOnly)

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    setFileName(file?.name ?? "")
    setIsImage(Boolean(file?.type.startsWith("image/")))
    setPreviewUrl(file ? URL.createObjectURL(file) : "")
  }

  function clearFile() {
    setFileName("")
    setPreviewUrl("")
    setIsImage(false)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <span>{label}</span>
      <Input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />
      <Attachment state={fileName || hasCurrentFile ? "done" : "idle"} className="w-full">
        <AttachmentMedia variant={mediaIsImage ? "image" : "icon"}>
          {mediaIsImage ? (
            <img src={mediaUrl} alt={`Preview ${label.toLowerCase()}`} />
          ) : fileName || hasCurrentFile ? (
            <FileTextIcon />
          ) : imageOnly ? (
            <ImageIcon />
          ) : (
            <UploadCloudIcon />
          )}
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{fileName || (hasCurrentFile ? "File saat ini" : `Pilih ${label.toLowerCase()}`)}</AttachmentTitle>
          <AttachmentDescription>
            {fileName ? "File baru siap dikirim." : hasCurrentFile ? "File tersimpan." : description}
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          {fileName ? (
            <AttachmentAction type="button" aria-label={`Hapus ${label.toLowerCase()}`} onClick={clearFile}>
              <XIcon />
            </AttachmentAction>
          ) : null}
        </AttachmentActions>
        <AttachmentTrigger aria-label={`Upload ${label.toLowerCase()}`} onClick={() => inputRef.current?.click()} />
      </Attachment>
    </div>
  )
}

export function AdminUserAccountForm({ user }: { user: UserFormData }) {
  const { isPending, run } = useAdminAction()

  function submit(formData: FormData) {
    run(() => updateAdminUser(formData))
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Akun</CardTitle>
        <CardDescription>Data utama dan akses user.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submit} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="userId" value={user.id} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nama
            <Input name="name" required defaultValue={user.name} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email
            <Input name="email" type="email" required defaultValue={user.email} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            WhatsApp
            <Input name="phone" defaultValue={user.phone ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Role
            <select name="role" defaultValue={user.role} className={selectClassName}>
              <option value="PATIENT">Pasien</option>
              <option value="PHARMACIST">Apoteker</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Status
            <select name="status" defaultValue={user.status} className={selectClassName}>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </label>
          <div className="flex items-end justify-end">
            <Button type="submit" disabled={isPending}>
              <SaveIcon data-icon="inline-start" />
              {isPending ? "Menyimpan..." : "Simpan Akun"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function AdminUserSecurityActions({ userId }: { userId: string }) {
  const { isPending, run } = useAdminAction()
  const [temporaryPassword, setTemporaryPassword] = useState("")

  function resetPassword() {
    const formData = new FormData()
    formData.set("userId", userId)
    run(() => resetAdminUserPassword(formData), (result) => {
      setTemporaryPassword(result.temporaryPassword ?? "")
    })
  }

  function revokeSessions() {
    const formData = new FormData()
    formData.set("userId", userId)
    run(() => revokeAdminUserSessions(formData))
  }

  async function copyPassword() {
    await navigator.clipboard.writeText(temporaryPassword)
    toast.success("Password disalin.")
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Keamanan</CardTitle>
        <CardDescription>Password dan sesi login.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {temporaryPassword ? (
          <div className="rounded-xl bg-secondary p-3">
            <p className="text-sm font-medium">Password sementara</p>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md bg-card px-2.5 py-2 text-sm">
                {temporaryPassword}
              </code>
              <Button type="button" variant="outline" size="icon-sm" aria-label="Salin password" onClick={copyPassword}>
                <CopyIcon />
              </Button>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={isPending} onClick={resetPassword}>
            <KeyRoundIcon data-icon="inline-start" />
            Reset Password
          </Button>
          <Button type="button" variant="outline" disabled={isPending} onClick={revokeSessions}>
            <LogOutIcon data-icon="inline-start" />
            Cabut Sesi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminPatientProfileForm({
  userId,
  profile,
}: {
  userId: string
  profile: PatientProfileData
}) {
  const { isPending, run } = useAdminAction()

  function submit(formData: FormData) {
    run(() => updateAdminPatientProfile(formData))
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Profil Pasien</CardTitle>
        <CardDescription>Data personal pasien.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submit} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="userId" value={userId} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Tanggal lahir
            <Input name="birthDate" type="date" defaultValue={dateValue(profile?.birthDate)} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Umur
            <Input name="age" type="number" min={0} defaultValue={profile?.age ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            WhatsApp pasien
            <Input name="patientPhone" defaultValue={profile?.phone ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Gender
            <select name="gender" defaultValue={profile?.gender ?? ""} className={selectClassName}>
              <option value="">Belum diisi</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Alamat
            <Textarea name="address" defaultValue={profile?.address ?? ""} className={fieldClassName} />
          </label>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={isPending}>
              <SaveIcon data-icon="inline-start" />
              {isPending ? "Menyimpan..." : "Simpan Profil Pasien"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function AdminPharmacistProfileForm({
  userId,
  profile,
}: {
  userId: string
  profile: PharmacistProfileData
}) {
  const { isPending, run } = useAdminAction()

  function submit(formData: FormData) {
    run(() => updateAdminPharmacistProfile(formData))
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Profil Apoteker</CardTitle>
        <CardDescription>Data STR, praktik, dan verifikasi.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submit} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="userId" value={userId} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Gelar
            <Input name="title" required defaultValue={profile?.title ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nomor STR
            <Input name="strNumber" required defaultValue={profile?.strNumber ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Status verifikasi
            <select name="verificationStatus" defaultValue={profile?.verificationStatus ?? "VERIFIED"} className={selectClassName}>
              <option value="VERIFIED">Terverifikasi</option>
              <option value="PENDING">Menunggu</option>
              <option value="NEEDS_REVISION">Perlu Revisi</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Ketersediaan
            <select name="availabilityStatus" defaultValue={profile?.availabilityStatus ?? "OFFLINE"} className={selectClassName}>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </label>
          <AdminAttachmentFileField
            name="profilePhoto"
            label="Foto profil"
            accept="image/png,image/jpeg,image/webp"
            description="PNG, JPG, atau WebP."
            currentUrl={profile?.profilePhotoUrl}
            imageOnly
          />
          <AdminAttachmentFileField
            name="strDocument"
            label="Dokumen STR"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            description="PNG, JPG, WebP, atau PDF."
            currentUrl={profile?.strDocumentUrl}
          />
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Bio
            <Textarea name="bio" required defaultValue={profile?.bio ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Topik bantuan
            <Input name="topics" required defaultValue={profile?.topics?.join(", ") ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Lokasi praktik
            <Input name="practiceLocation" required defaultValue={profile?.practiceLocation ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Jam layanan
            <Input name="serviceHours" required defaultValue={profile?.serviceHours ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Pengalaman
            <Textarea name="experienceSummary" required defaultValue={profile?.experienceSummary ?? ""} className={fieldClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
            Catatan admin
            <Textarea name="adminNote" defaultValue={profile?.adminNote ?? ""} className={fieldClassName} />
          </label>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={isPending}>
              <SaveIcon data-icon="inline-start" />
              {isPending ? "Menyimpan..." : "Simpan Profil Apoteker"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
