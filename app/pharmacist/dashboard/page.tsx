import { savePharmacistProfile } from "@/app/actions/pharmacist/save-profile"
import { AppMessage } from "@/components/app-message"
import { ProfilePhotoField } from "@/components/pharmacists/profile-photo-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requireRole } from "@/lib/session"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const verificationLabels: Record<string, string> = {
  PENDING: "Menunggu Verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  NEEDS_REVISION: "Perlu Revisi",
}

export default async function PharmacistDashboardPage({ searchParams }: PageProps) {
  const user = await requireRole("PHARMACIST")
  const profile = user.pharmacistProfile
  const params = await searchParams

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8">
      <header>
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Apoteker</p>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {verificationLabels[profile?.verificationStatus ?? "PENDING"]}
          </p>
        </div>
      </header>

      <form action={savePharmacistProfile} className="flex flex-col gap-5 rounded-md border bg-card p-5">
        <AppMessage error={params?.error} success={params?.success} />
        <ProfilePhotoField
          currentImage={profile?.profilePhotoUrl ?? user.image}
          name={user.name}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nama lengkap
            <Input name="name" required defaultValue={user.name} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Status ketersediaan
            <select
              name="availabilityStatus"
              defaultValue={profile?.availabilityStatus ?? "OFFLINE"}
              className="h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs"
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Gelar
            <Input name="title" required defaultValue={profile?.title ?? ""} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nomor STR
            <Input name="strNumber" required defaultValue={profile?.strNumber ?? ""} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Dokumen pendukung STR
            <Input name="strDocument" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Bio singkat
          <Textarea name="bio" required defaultValue={profile?.bio ?? ""} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Topik bantuan
          <Input name="topics" required defaultValue={profile?.topics?.join(", ") ?? ""} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Lokasi praktik
            <Input name="practiceLocation" required defaultValue={profile?.practiceLocation ?? ""} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Jam layanan
            <Input name="serviceHours" required defaultValue={profile?.serviceHours ?? ""} />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Pengalaman singkat
          <Textarea name="experienceSummary" required defaultValue={profile?.experienceSummary ?? ""} />
        </label>
        <Button type="submit">Simpan Profil</Button>
      </form>
    </main>
  )
}
