import Link from "next/link"

import { registerPatient } from "@/app/actions/patient/register"
import { AppMessage } from "@/components/app-message"
import { AuthBrandLink } from "@/components/auth-brand-link"
import { PasswordInput } from "@/components/password-input"
import { GoogleSignInButton } from "@/components/social-sign-in-button"
import { SubmitButton } from "@/components/submit-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams
  const callbackUrl = Array.isArray(params?.callbackUrl)
    ? params.callbackUrl[0]
    : params?.callbackUrl

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-secondary bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-[size:32px_32px] px-6 py-10">
      <AuthBrandLink />
      <Card className="w-full max-w-md">
        <form action={registerPatient} className="flex flex-col gap-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
          <CardHeader className="gap-2 text-center">
            <CardTitle className="text-2xl font-semibold">
              Daftar Akun
            </CardTitle>
            <CardDescription>
              Daftar dengan Google atau lengkapi formulir di bawah.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <AppMessage error={params?.error} />
            <GoogleSignInButton label="Daftar dengan Google" callbackUrl={callbackUrl} />
            <div className="relative flex items-center justify-center">
              <Separator className="w-full" />
              <span className="absolute bg-card px-2 text-xs uppercase text-muted-foreground">
                atau
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <label htmlFor="name">Nama lengkap</label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <label htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <label htmlFor="phone">Nomor WhatsApp</label>
              <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <label htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <label htmlFor="confirmPassword">Konfirmasi password</label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <SubmitButton pendingText="Mendaftar...">Daftar</SubmitButton>
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={
                  callbackUrl
                    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
                    : "/login"
                }
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
