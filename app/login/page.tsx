import Link from "next/link"

import { login } from "@/app/actions/auth/login"
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

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams
  const identifier = Array.isArray(params?.identifier) ? params.identifier[0] : params?.identifier
  const callbackUrl = Array.isArray(params?.callbackUrl) ? params.callbackUrl[0] : params?.callbackUrl

  return (
    <main className="flex min-h-svh items-center justify-center bg-background bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_30%,transparent)_1px,transparent_1px)] bg-[size:32px_32px] px-6 py-10">
      <Card className="w-full max-w-sm">
        <form action={login} className="flex flex-col gap-6">
          <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
          <CardHeader className="gap-2 text-center">
            <CardTitle className="text-2xl font-semibold">Masuk</CardTitle>
            <CardDescription>Gunakan email atau nomor WhatsApp.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <AppMessage error={params?.error} />
            <label className="flex flex-col gap-2 text-sm font-medium">
              Email atau nomor WhatsApp
              <Input name="identifier" required autoComplete="username" defaultValue={identifier} />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Password
              <PasswordInput name="password" required autoComplete="current-password" />
            </label>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <Button type="submit">Masuk</Button>
            <p className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                className="font-medium text-primary underline-offset-4 hover:underline"
                href={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register"}
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
