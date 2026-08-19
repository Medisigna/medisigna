import Link from "next/link"

import { login } from "@/app/actions/auth/login"
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

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const identifier = Array.isArray(params?.identifier)
    ? params.identifier[0]
    : params?.identifier
  const callbackUrl = Array.isArray(params?.callbackUrl)
    ? params.callbackUrl[0]
    : params?.callbackUrl

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-secondary bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-[size:32px_32px] px-6 py-10">
      <AuthBrandLink />
      <Card className="w-full max-w-sm">
        <form action={login} className="flex flex-col gap-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
          <CardHeader className="gap-2 text-center">
            <CardTitle className="text-2xl font-semibold">Masuk</CardTitle>
            <CardDescription>
              Masuk dengan akun Google atau email Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <AppMessage error={params?.error} />
            <GoogleSignInButton label="Masuk dengan Google" callbackUrl={callbackUrl} />
            <div className="relative flex items-center justify-center">
              <Separator className="w-full" />
              <span className="absolute bg-card px-2 text-xs uppercase text-muted-foreground">
                atau
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <label htmlFor="identifier">Email atau nomor WhatsApp</label>
              <Input
                id="identifier"
                name="identifier"
                required
                autoComplete="username"
                defaultValue={identifier}
              />
            </div>
            <div className="flex flex-col gap-2 text-sm font-medium">
              <label htmlFor="password">Password</label>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <SubmitButton pendingText="Masuk...">Masuk</SubmitButton>
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={
                  callbackUrl
                    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
                    : "/register"
                }
              >
                Daftar Akun
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
