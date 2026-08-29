import Link from "next/link"
import type { ReactNode } from "react"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"

import {
  AdminPatientProfileForm,
  AdminPharmacistProfileForm,
  AdminUserAccountForm,
  AdminUserSecurityActions,
} from "@/components/admin/users/admin-user-forms"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  adminAccountStatusLabels,
  adminPharmacistStatusLabels,
  adminRoleLabels,
  adminUserActionLabels,
  getAdminUserDetail,
  type AccountStatusValue,
  type PharmacistVerificationStatusValue,
  type UserRoleValue,
} from "@/lib/admin-users"
import { cn } from "@/lib/utils"

type PageProps = {
  params: Promise<{ id: string }>
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(date)
}

function statusPill(label: string, tone: "primary" | "muted" | "warning" | "danger" = "muted") {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-1 text-xs font-medium",
        tone === "primary" && "bg-primary/10 text-primary",
        tone === "muted" && "bg-secondary text-muted-foreground",
        tone === "warning" && "bg-yellow-100 text-yellow-800",
        tone === "danger" && "bg-destructive/10 text-destructive"
      )}
    >
      {label}
    </span>
  )
}

function accountTone(status: AccountStatusValue) {
  return status === "ACTIVE" ? "primary" : "danger"
}

function pharmacistTone(status: PharmacistVerificationStatusValue) {
  if (status === "VERIFIED") return "primary"
  if (status === "PENDING") return "warning"
  if (status === "REJECTED") return "danger"
  return "muted"
}

function fileLink(label: string, src?: string | null) {
  if (!src) return <span className="text-muted-foreground">Tidak ada</span>

  return (
    <a
      className="inline-flex max-w-full min-w-0 items-center gap-1 overflow-hidden underline-offset-4 hover:underline"
      href={src}
      target="_blank"
      rel="noreferrer"
    >
      <span className="truncate">{label}</span>
      <ExternalLinkIcon className="size-3 shrink-0" />
    </a>
  )
}

function CountGrid({
  counts,
}: {
  counts: Array<[string, number]>
}) {
  return (
    <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {counts.map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-xl bg-card p-4 shadow-none">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
      ))}
    </section>
  )
}

function SnapshotCard({
  title,
  description,
  rows,
}: {
  title: string
  description: string
  rows: Array<[string, ReactNode]>
}) {
  return (
    <Card className="min-w-0 shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <dl className="grid min-w-0 gap-3 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="mt-1 min-w-0 break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params
  const detail = await getAdminUserDetail(id)
  if (!detail) notFound()

  const { user, auditLogs } = detail
  const pharmacistStatus = user.pharmacistProfile?.verificationStatus as PharmacistVerificationStatusValue | undefined

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 overflow-x-hidden px-4 py-8 sm:px-6">
      <Button asChild variant="ghost" className="w-fit">
        <Link href="/admin/users">
          <ArrowLeftIcon data-icon="inline-start" />
          Kembali
        </Link>
      </Button>

      <header className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">User Management</p>
          <h1 className="break-words text-2xl font-semibold">{user.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {statusPill(adminRoleLabels[user.role as UserRoleValue], "muted")}
            {statusPill(adminAccountStatusLabels[user.status as AccountStatusValue], accountTone(user.status as AccountStatusValue))}
            {pharmacistStatus
              ? statusPill(adminPharmacistStatusLabels[pharmacistStatus], pharmacistTone(pharmacistStatus))
              : null}
          </div>
        </div>
      </header>

      <CountGrid
        counts={[
          ["Sesi login", user._count.sessions],
          ["Konsultasi pasien", user._count.patientSessions],
          ["Konsultasi apoteker", user._count.pharmacistSessions],
          ["Pesan", user._count.sentMessages],
          ["Obat direview", user._count.reviewedDrugs],
          ["Artikel", user._count.authoredArticles],
          ["Video", user._count.authoredVideos],
          ["Forum", user._count.forumThreads + user._count.forumPosts],
        ]}
      />

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminUserAccountForm
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              status: user.status,
            }}
          />
          {user.role === "PATIENT" || user.patientProfile ? (
            <AdminPatientProfileForm userId={user.id} profile={user.patientProfile} />
          ) : null}
          {user.role === "PHARMACIST" || user.pharmacistProfile ? (
            <AdminPharmacistProfileForm userId={user.id} profile={user.pharmacistProfile} />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminUserSecurityActions userId={user.id} />
          <SnapshotCard
            title="Ringkasan"
            description="Identitas dan dokumen."
            rows={[
              ["Email", user.email],
              ["WhatsApp", user.phone || "-"],
              ["Dibuat", formatDateTime(user.createdAt)],
              ["Diubah", formatDateTime(user.updatedAt)],
              ["Foto profil", fileLink("Buka foto", user.pharmacistProfile?.profilePhotoUrl ?? user.image)],
              ["Dokumen STR", fileLink("Buka dokumen", user.pharmacistProfile?.strDocumentUrl)],
              ["Token FCM", user._count.fcmTokens],
              ["Notifikasi", user._count.notifications],
            ]}
          />
          <Card className="min-w-0 shadow-none">
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Riwayat perubahan admin.</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0">
              {auditLogs.length ? (
                <div className="flex min-w-0 flex-col gap-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="min-w-0 rounded-xl bg-secondary p-3">
                      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                        <p className="min-w-0 break-words font-medium">
                          {adminUserActionLabels[log.action] ?? log.action}
                        </p>
                        <p className="shrink-0 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</p>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {log.actor?.name ?? "Admin"} · {log.actor?.email ?? "-"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada audit log.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
