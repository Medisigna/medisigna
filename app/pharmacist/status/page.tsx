import { logout } from "@/app/actions/auth/logout"
import { Button } from "@/components/ui/button"
import { requireRole } from "@/lib/session"

const labels: Record<string, string> = {
  PENDING: "Menunggu Verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
  NEEDS_REVISION: "Perlu Revisi",
}

export default async function PharmacistStatusPage() {
  const user = await requireRole("PHARMACIST")
  const profile = user.pharmacistProfile

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-md border bg-card p-6">
        <p className="text-sm text-muted-foreground">Status Pendaftaran</p>
        <h1 className="mt-1 text-2xl font-semibold">
          {profile?.verificationStatus === "PENDING"
            ? "Pendaftaran berhasil. Akun Anda menunggu verifikasi admin."
            : labels[profile?.verificationStatus ?? "PENDING"]}
        </h1>
        {profile?.adminNote ? <p className="mt-4 text-sm text-muted-foreground">{profile.adminNote}</p> : null}
        <div className="mt-6 flex gap-2">
          <Button asChild>
            <a href="/pharmacist/dashboard">Buka Dashboard</a>
          </Button>
          <form action={logout}>
            <Button variant="outline" type="submit">
              Keluar
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
