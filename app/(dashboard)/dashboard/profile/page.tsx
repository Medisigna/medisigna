import { savePatientProfile } from "@/app/actions/patient/save-profile"
import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requireRole } from "@/lib/session"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const user = await requireRole("PATIENT")
  const profile = user.patientProfile
  const params = await searchParams

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <form action={savePatientProfile} className="flex flex-col gap-5 rounded-md border bg-card p-5">
        <AppMessage error={params?.error} success={params?.success} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Umur
            <Input name="age" type="number" min={0} defaultValue={profile?.age ?? ""} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Tanggal lahir
            <Input
              name="birthDate"
              type="date"
              defaultValue={profile?.birthDate ? profile.birthDate.toISOString().slice(0, 10) : ""}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nomor HP
            <Input name="phone" defaultValue={profile?.phone ?? ""} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Jenis kelamin
            <select
              name="gender"
              defaultValue={profile?.gender ?? ""}
              className="h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs"
            >
              <option value="">Pilih</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Alamat
          <Textarea name="address" defaultValue={profile?.address ?? ""} />
        </label>
        <Button type="submit">Simpan Profil</Button>
      </form>
    </main>
  )
}
