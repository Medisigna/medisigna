import Link from "next/link"

import { registerPatient } from "@/app/actions/patient/register"
import { AppMessage } from "@/components/app-message"
import { PasswordInput } from "@/components/password-input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams
  const callbackUrl = Array.isArray(params?.callbackUrl) ? params.callbackUrl[0] : params?.callbackUrl

  return (
    <main className="flex min-h-svh items-center justify-center bg-background bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-[size:32px_32px] px-6 py-10">
      <Card className="w-full max-w-md">
        <form action={registerPatient} className="flex flex-col gap-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
          <CardHeader className="gap-2 text-center">
            <CardTitle className="text-2xl font-semibold">Daftar Akun</CardTitle>
            <CardDescription>Akun masyarakat untuk mulai menggunakan Medisigna.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <AppMessage error={params?.error} />
            <label className="flex flex-col gap-2 text-sm font-medium">
              Nama lengkap
              <Input name="name" required autoComplete="name" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email
              <Input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Nomor WhatsApp
              <Input name="phone" type="tel" required autoComplete="tel" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Konfirmasi password
              <PasswordInput name="confirmPassword" required minLength={8} autoComplete="new-password" />
            </label>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit">Daftar</Button>
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
              >
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
