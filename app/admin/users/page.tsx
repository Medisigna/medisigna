import Link from "next/link"
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, FilterXIcon } from "lucide-react"

import { AppMessage } from "@/components/app-message"
import { AdminUserCreateDialog } from "@/components/admin/users/admin-user-create-dialog"
import { DebouncedSearchInput } from "@/components/debounced-search-input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  adminAccountStatusLabels,
  adminPharmacistStatusLabels,
  adminRoleLabels,
  adminUsersHref,
  getAdminUsers,
  parseAdminUserListParams,
  type AccountStatusValue,
  type AdminUserListItem,
  type PharmacistVerificationStatusValue,
  type UserRoleValue,
} from "@/lib/admin-users"
import { cn } from "@/lib/utils"

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const roleFilterLabels: Record<string, string> = {
  ALL: "Semua role",
  ...adminRoleLabels,
}

const accountStatusFilterLabels: Record<string, string> = {
  ALL: "Semua status",
  ...adminAccountStatusLabels,
}

const pharmacistStatusFilterLabels: Record<string, string> = {
  ALL: "Semua verifikasi",
  ...adminPharmacistStatusLabels,
}

const sortLabels: Record<string, string> = {
  newest: "Terbaru",
  oldest: "Terlama",
  name: "Nama",
  role: "Role",
  status: "Status",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
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

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const query = await searchParams
  const params = parseAdminUserListParams(query)
  const result = await getAdminUsers(params)
  const clearHref = adminUsersHref()
  const previousHref = adminUsersHref({ ...params, page: Math.max(1, result.page - 1) })
  const nextHref = adminUsersHref({ ...params, page: Math.min(result.pageCount, result.page + 1) })

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
      <AppMessage error={query?.error} success={query?.success} />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard Admin</p>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} user sesuai filter
          </p>
        </div>
        <AdminUserCreateDialog />
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {[
          ["Total", result.stats.total],
          ["Aktif", result.stats.active],
          ["Nonaktif", result.stats.inactive],
          ["Pasien", result.stats.patients],
          ["Apoteker", result.stats.pharmacists],
          ["Admin", result.stats.admins],
          ["Pending", result.stats.pendingPharmacists],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-card p-4 shadow-none">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-xl bg-card p-4 shadow-none">
        <DebouncedSearchInput
          action="/admin/users"
          query={params.query}
          placeholder="Cari nama, email, atau WhatsApp"
          ariaLabel="Cari user"
          hiddenParams={{
            role: params.role !== "ALL" ? params.role : undefined,
            status: params.status !== "ALL" ? params.status : undefined,
            pharmacistStatus: params.pharmacistStatus !== "ALL" ? params.pharmacistStatus : undefined,
            sort: params.sort !== "newest" ? params.sort : undefined,
          }}
          inputGroupClassName="h-11 bg-background shadow-none"
        />
        <form action="/admin/users" className="grid gap-3 md:grid-cols-4 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          {params.query ? <input type="hidden" name="q" value={params.query} /> : null}
          <select name="role" defaultValue={params.role} className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-none">
            {Object.entries(roleFilterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={params.status} className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-none">
            {Object.entries(accountStatusFilterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="pharmacistStatus" defaultValue={params.pharmacistStatus} className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-none">
            {Object.entries(pharmacistStatusFilterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select name="sort" defaultValue={params.sort} className="h-10 rounded-md border border-input bg-background px-2.5 text-sm shadow-none">
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button type="submit" variant="outline" className="flex-1 xl:flex-none">
              Terapkan
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Hapus filter">
              <Link href={clearHref}>
                <FilterXIcon />
              </Link>
            </Button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl bg-card shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verifikasi</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.users.length ? (
              result.users.map((user: AdminUserListItem) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                        {user.name}
                      </Link>
                      <span className="max-w-64 truncate text-xs text-muted-foreground">{user.email}</span>
                      {user.phone ? <span className="text-xs text-muted-foreground">{user.phone}</span> : null}
                    </div>
                  </TableCell>
                  <TableCell>{adminRoleLabels[user.role as UserRoleValue]}</TableCell>
                  <TableCell>{statusPill(adminAccountStatusLabels[user.status as AccountStatusValue], accountTone(user.status as AccountStatusValue))}</TableCell>
                  <TableCell>
                    {user.pharmacistProfile
                      ? statusPill(
                          adminPharmacistStatusLabels[
                            user.pharmacistProfile.verificationStatus as PharmacistVerificationStatusValue
                          ],
                          pharmacistTone(user.pharmacistProfile.verificationStatus as PharmacistVerificationStatusValue)
                        )
                      : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user._count.patientSessions + user._count.pharmacistSessions} konsultasi,{" "}
                    {user._count.authoredArticles + user._count.authoredVideos} konten,{" "}
                    {user._count.forumThreads + user._count.forumPosts} forum
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon-sm" aria-label="Lihat user">
                      <Link href={`/admin/users/${user.id}`}>
                        <EyeIcon />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  User tidak ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Halaman {result.page} dari {result.pageCount}
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" aria-disabled={result.page <= 1}>
            <Link href={previousHref}>
              <ArrowLeftIcon data-icon="inline-start" />
              Sebelumnya
            </Link>
          </Button>
          <Button asChild variant="outline" aria-disabled={result.page >= result.pageCount}>
            <Link href={nextHref}>
              Berikutnya
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
