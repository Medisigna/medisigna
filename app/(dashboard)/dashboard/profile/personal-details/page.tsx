import { savePatientProfile } from "@/app/actions/patient/save-profile"
import { AppMessage } from "@/components/app-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requireRole } from "@/lib/session"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function PersonalDetailsPage({ searchParams }: PageProps) {
  const user = await requireRole("PATIENT")
  const profile = user.patientProfile
  const params = await searchParams

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 bg-background px-4 py-7 text-foreground md:my-6 md:min-h-0 md:px-8 md:py-8">
      <AppMessage error={params?.error} success={params?.success} />

      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Kembali ke profil">
          <Link href="/dashboard/profile">
            <ArrowLeftIcon aria-hidden="true" />
          </Link>
        </Button>
        <h1 className="text-center text-xl font-semibold tracking-tight">Detail pribadi</h1>
        <div className="size-9" />
      </header>

      <form action={savePatientProfile} className="flex flex-col gap-5 rounded-xl bg-card p-4">
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
            <Input name="phone" type="tel" defaultValue={profile?.phone ?? user.phone ?? ""} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Jenis kelamin
            <select
              name="gender"
              defaultValue={profile?.gender ?? ""}
              className="h-9 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

        <Button type="submit" className="w-full">
          Simpan Profil
        </Button>
      </form>
    </main>
  )
}
