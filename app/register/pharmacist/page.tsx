import Link from "next/link"

import { registerPharmacist } from "@/app/actions/pharmacist/register"
import { AppMessage } from "@/components/app-message"
import { AuthBrandLink } from "@/components/auth-brand-link"
import { RegistrationFileField } from "@/components/pharmacists/registration-file-field"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const fieldSurfaceClassName = "bg-card shadow-none"

export default async function RegisterPharmacistPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col gap-5 px-6 py-10">
      <AuthBrandLink />
      <form action={registerPharmacist} className="flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Daftar sebagai Apoteker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Akun perlu diverifikasi admin sebelum tampil di publik.
          </p>
        </div>
        <AppMessage error={params?.error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nama lengkap
            <Input name="name" required autoComplete="name" className={fieldSurfaceClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Email atau nomor WhatsApp
            <Input name="identifier" required autoComplete="username" className={fieldSurfaceClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Password
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={fieldSurfaceClassName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Konfirmasi password
            <Input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={fieldSurfaceClassName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Gelar
            <Input name="title" required className={fieldSurfaceClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nomor STR
            <Input name="strNumber" required className={fieldSurfaceClassName} />
          </label>
          <RegistrationFileField
            name="profilePhoto"
            label="Foto profil"
            accept="image/png,image/jpeg,image/webp"
            description="PNG, JPG, atau WebP."
            required
            imageOnly
          />
          <RegistrationFileField
            name="strDocument"
            label="Dokumen pendukung STR"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            description="PNG, JPG, WebP, atau PDF."
            required
          />
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Bio singkat
          <Textarea name="bio" required className={fieldSurfaceClassName} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Topik bantuan
          <Input
            name="topics"
            required
            placeholder="Contoh: obat bebas, resep, efek samping"
            className={fieldSurfaceClassName}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Lokasi praktik
            <Input name="practiceLocation" required className={fieldSurfaceClassName} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Jam layanan
            <Input
              name="serviceHours"
              required
              placeholder="Senin-Jumat 09.00-17.00"
              className={fieldSurfaceClassName}
            />
          </label>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Pengalaman singkat
          <Textarea name="experienceSummary" required className={fieldSurfaceClassName} />
        </label>
        <SubmitButton pendingText="Mengirim...">Kirim Pendaftaran</SubmitButton>
        <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" href="/login">
          Sudah punya akun? Masuk
        </Link>
      </form>
    </main>
  )
}
