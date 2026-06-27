# PLAN TEKNIS: Informasi Obat Mode Publik, Mode Apoteker, Pagination, dan Admin CMS

Dokumen ini adalah instruksi implementasi untuk junior programmer atau agent biaya rendah. Ikuti urutan fase. Jangan lompat ke CMS penuh sebelum mode publik/apoteker dan pagination stabil.

## Target Akhir

Fitur Informasi Obat memiliki tiga pengalaman berbeda:

- Publik dan pasien melihat informasi obat versi masyarakat.
- Apoteker melihat informasi obat versi profesional yang lebih detail di dashboard apoteker.
- Admin mengelola konten obat melalui dashboard admin tanpa bottom navigation mobile.

Fitur juga harus mendukung pagination agar list obat tetap ringan saat data bertambah.

## Batasan Implementasi

- Gunakan Bun untuk command project.
- Jangan gunakan npm, pnpm, atau yarn.
- Jangan jalankan build, lint, dev server, Prisma migrate, atau Prisma generate tanpa izin eksplisit.
- Typecheck dan unit test boleh dijalankan.
- Gunakan Bahasa Indonesia untuk UI copy.
- Gunakan Bahasa Inggris untuk nama file, route, function, variable, type, dan field database.
- Gunakan shadcn/ui component yang sudah tersedia sebelum membuat UI custom.
- Untuk UI baru, ikuti gaya dashboard yang sudah ada. Jangan membuat landing page.
- Untuk dashboard admin, jangan tambah bottom navigation mobile.
- Jangan menampilkan field internal apoteker pada halaman publik atau dashboard pasien.
- Jangan membuat rekomendasi diagnosis atau dosis spesifik yang berisiko klinis.

## Kondisi Saat Ini

Route yang sudah ada:

- Publik:
  - `app/obat/page.tsx`
  - `app/obat/[slug]/page.tsx`
- Dashboard pasien:
  - `app/(dashboard)/dashboard/obat/page.tsx`
  - `app/(dashboard)/dashboard/obat/[slug]/page.tsx`
- Dashboard apoteker:
  - `app/pharmacist/dashboard/layout.tsx`
  - `app/pharmacist/dashboard/page.tsx`
  - `app/pharmacist/dashboard/chat/*`
- Admin:
  - `app/admin/page.tsx`

Komponen dan helper yang sudah ada:

- `components/drugs/drug-list.tsx`
- `components/drugs/drug-detail.tsx`
- `lib/drugs.ts`
- `lib/drug-search.ts`
- `lib/drug-search.test.ts`
- `components/user-dashboard-shell.tsx`

Model yang sudah ada:

- `DrugInformation`
- `DrugPublicationStatus`
- `User`
- `PharmacistProfile`

## Pembagian Mode

### Mode Publik

Dipakai oleh:

- `/obat`
- `/obat/[slug]`
- `/dashboard/obat`
- `/dashboard/obat/[slug]`

Konten yang boleh tampil:

- nama generik
- contoh merek
- alias/nama lain
- kegunaan umum
- cara pakai umum
- hubungan makanan
- efek samping umum
- peringatan
- kapan mencari bantuan
- reviewer dan tanggal review
- CTA tanya apoteker

Konten yang tidak boleh tampil:

- catatan internal
- detail interaksi profesional
- pertanyaan skrining internal
- monitoring profesional
- referensi internal mentah
- workflow admin

### Mode Apoteker

Dipakai oleh:

- `/pharmacist/dashboard/obat`
- `/pharmacist/dashboard/obat/[slug]`

Konten yang boleh tampil:

- semua konten publik sebagai ringkasan
- kelas/golongan obat
- bentuk sediaan
- indikasi versi apoteker
- counseling points
- pertanyaan skrining
- kontraindikasi/perhatian khusus
- interaksi penting
- efek samping serius
- parameter monitoring
- kriteria rujukan/red flags
- catatan internal apoteker
- referensi konten
- metadata review

Mode apoteker adalah read-only pada tahap awal.

### Mode Admin

Dipakai oleh:

- `/admin/obat`
- `/admin/obat/new`
- `/admin/obat/[id]`

Admin boleh:

- melihat semua konten obat, termasuk draft
- membuat konten obat baru
- mengedit konten publik dan konten apoteker
- publish dan unpublish
- mengubah reviewer dan tanggal review
- menandai konten demo atau produksi

Admin tidak perlu bottom navigation mobile. Gunakan layout dashboard kerja berbasis sidebar/header.

## Fase 0 - Persiapan

Tujuan: pastikan implementer memahami struktur project sebelum mengedit.

Langkah:

1. Baca `AGENTS.md`.
2. Baca skill project yang relevan:
   - `.agents/skills/frontend-design/SKILL.md`
   - `.agents/skills/shadcn/SKILL.md`
   - `.agents/skills/vercel-react-best-practices/SKILL.md`
   - `.agents/skills/prisma-postgres/SKILL.md`
3. Inspect file berikut:
   - `lib/drugs.ts`
   - `components/drugs/drug-list.tsx`
   - `components/drugs/drug-detail.tsx`
   - `components/user-dashboard-shell.tsx`
   - `app/admin/page.tsx`
   - `app/pharmacist/dashboard/layout.tsx`
   - `prisma/schema.prisma`
   - `prisma/seed.ts`

Acceptance criteria:

- Implementer tahu route mana untuk publik, pasien, apoteker, dan admin.
- Implementer tahu dashboard apoteker memakai `PharmacistDashboardShell`.
- Implementer tahu admin saat ini masih satu halaman dan perlu layout sendiri.

## Fase 1 - Pagination Informasi Obat

Tujuan: list obat tidak fetch semua data dan mendukung navigasi halaman.

### Data Contract

Ubah helper list obat agar mengembalikan metadata pagination.

Tambahkan type di `lib/drugs.ts`:

```ts
export type DrugListResult = {
  drugs: DrugListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
```

Tambahkan constant:

```ts
const DEFAULT_DRUG_PAGE_SIZE = 12
```

Ubah `getPublishedDrugs(query)` menjadi:

```ts
getPublishedDrugs({
  query,
  page,
  pageSize,
})
```

Jangan hardcode limit 100 sebagai final behavior. Boleh tetap ada maximum internal, misalnya `MAX_DRUG_PAGE_SIZE = 50`.

### Query Param

Gunakan query param:

- `q`: search text
- `page`: nomor halaman, mulai dari 1

Route yang diubah:

- `app/obat/page.tsx`
- `app/(dashboard)/dashboard/obat/page.tsx`

Parsing:

- Jika `page` invalid, pakai `1`.
- Jika `page < 1`, pakai `1`.
- Trim `q`.

### UI

Ubah `DrugList` agar menerima result pagination atau props pagination tambahan.

UI publik dan pasien:

- Tampilkan jumlah data: `12 dari 120 informasi`
- Tampilkan tombol:
  - `Sebelumnya`
  - `Berikutnya`
- Pertahankan query `q` saat pindah halaman.
- Jangan gunakan infinite scroll dulu.

Acceptance criteria:

- `/obat?q=para&page=2` menampilkan page 2.
- Tombol sebelumnya disabled atau hidden saat page 1.
- Tombol berikutnya disabled atau hidden saat page terakhir.
- Search baru dari form kembali ke page 1.
- Dashboard pasien memakai pagination yang sama.

## Fase 2 - Field Mode Apoteker di Database

Tujuan: konten profesional dipisah dari konten publik.

Ubah `prisma/schema.prisma` pada model `DrugInformation`.

Tambahkan field:

```prisma
drugClass             String?
dosageForm            String?
pharmacistIndications String?
counselingPoints      String[] @default([])
screeningQuestions    String[] @default([])
contraindications     String[] @default([])
majorInteractions     String[] @default([])
seriousSideEffects    String[] @default([])
monitoringParameters  String[] @default([])
referralCriteria      String[] @default([])
internalNotes         String?
references            String[] @default([])
reviewDueAt           DateTime?
```

Migration:

- Buat folder migration baru manual.
- Tambahkan kolom nullable untuk string/date.
- Tambahkan kolom array dengan `NOT NULL DEFAULT ARRAY[]::TEXT[]`.
- Jangan menjalankan migration tanpa izin.

Contoh SQL:

```sql
ALTER TABLE "DrugInformation"
  ADD COLUMN "drugClass" TEXT,
  ADD COLUMN "dosageForm" TEXT,
  ADD COLUMN "pharmacistIndications" TEXT,
  ADD COLUMN "counselingPoints" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "screeningQuestions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "contraindications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "majorInteractions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "seriousSideEffects" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "monitoringParameters" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "referralCriteria" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "internalNotes" TEXT,
  ADD COLUMN "references" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "reviewDueAt" TIMESTAMP(3);
```

Update `prisma/seed.ts`:

- Tambahkan contoh data untuk semua field baru.
- Isi dengan Bahasa Indonesia.
- Tetap jelas bahwa data seed adalah demo.

Acceptance criteria:

- `bun.cmd x prisma validate` lulus.
- Existing route publik tetap typecheck.
- Field apoteker tidak tampil di halaman publik.

## Fase 3 - Data Helper Untuk Mode Publik dan Apoteker

Tujuan: query data eksplisit sesuai mode agar tidak ada accidental exposure.

Di `lib/drugs.ts`, pisahkan type dan query:

```ts
export type PublicDrugDetailData = ...
export type PharmacistDrugDetailData = PublicDrugDetailData & {
  drugClass: string | null
  dosageForm: string | null
  pharmacistIndications: string | null
  counselingPoints: string[]
  screeningQuestions: string[]
  contraindications: string[]
  majorInteractions: string[]
  seriousSideEffects: string[]
  monitoringParameters: string[]
  referralCriteria: string[]
  internalNotes: string | null
  references: string[]
  reviewDueAt: Date | null
}
```

Helper yang dibuat/diubah:

- `getPublishedDrugs({ query, page, pageSize })`
- `getPublishedDrug(slug)`
- `getPharmacistDrugs({ query, page, pageSize })`
- `getPharmacistDrug(slug)`
- `getAdminDrugs({ query, page, pageSize, status })`
- `getAdminDrug(id)`

Rules:

- Public helper hanya select field publik.
- Pharmacist helper select field publik + apoteker.
- Admin helper boleh select semua field yang dibutuhkan CMS.
- Public dan pharmacist hanya tampilkan `status: "PUBLISHED"` dan reviewer `VERIFIED`.
- Admin boleh melihat `DRAFT` dan `PUBLISHED`.

Acceptance criteria:

- Tidak ada field internal di payload komponen publik.
- Dashboard apoteker tidak memakai `DrugDetail` publik secara langsung untuk data profesional.

## Fase 4 - Route dan UI Mode Apoteker

Tujuan: apoteker punya halaman informasi obat detail profesional read-only.

### Update Sidebar Apoteker

File:

- `components/user-dashboard-shell.tsx`

Tambahkan nav item:

```ts
{ href: "/pharmacist/dashboard/obat", label: "Obat", icon: PillIcon }
```

Jangan ubah bottom nav pasien.

### Route List

Buat:

- `app/pharmacist/dashboard/obat/page.tsx`

Behavior:

- Protected by existing `app/pharmacist/dashboard/layout.tsx`.
- Ambil query `q` dan `page`.
- Panggil `getPharmacistDrugs`.
- Render list/table ringkas.

UI:

- Search input.
- Badge golongan obat jika ada.
- Badge `Konten demo` jika `isDemo`.
- Tanggal review.
- Tombol `Buka detail`.
- Pagination `Sebelumnya` dan `Berikutnya`.

Gunakan Bahasa Indonesia.

### Route Detail

Buat:

- `app/pharmacist/dashboard/obat/[slug]/page.tsx`

Behavior:

- Ambil `getPharmacistDrug(slug)`.
- Jika tidak ada, `notFound()`.

Komponen baru:

- `components/drugs/pharmacist-drug-detail.tsx`

Layout:

- Header:
  - nama generik
  - contoh merek
  - badge golongan
  - badge demo/produksi
- Ringkasan publik:
  - kegunaan umum
  - cara pakai umum
  - efek samping umum
  - peringatan
- Section profesional:
  - indikasi apoteker
  - counseling points
  - pertanyaan skrining
  - kontraindikasi/perhatian
  - interaksi penting
  - efek samping serius
  - monitoring
  - kriteria rujukan
  - catatan internal
  - referensi
- Sidebar:
  - reviewer
  - tanggal review
  - review due date
  - CTA kembali

Acceptance criteria:

- Apoteker bisa membuka `/pharmacist/dashboard/obat`.
- Apoteker bisa mencari obat dan membuka detail.
- Pasien tidak memiliki route ke mode apoteker.
- Konten apoteker tidak muncul di `/obat` dan `/dashboard/obat`.

## Fase 5 - Dashboard Admin Shell

Tujuan: admin punya layout kerja yang konsisten dengan dashboard apoteker, tetapi tanpa bottom nav mobile.

Saat ini admin ada di:

- `app/admin/page.tsx`

Buat shell admin baru:

- `components/admin-dashboard-shell.tsx`
- `app/admin/layout.tsx`

Shell admin harus:

- Memakai `Sidebar` shadcn seperti `components/user-dashboard-shell.tsx`.
- Memiliki nav item:
  - `/admin` - Verifikasi Apoteker
  - `/admin/obat` - Informasi Obat
- Memiliki tombol logout.
- Menampilkan nama dan email admin.
- Tidak memiliki bottom navigation mobile.
- Tetap responsive dengan sidebar/collapsible behavior.

Update:

- Pindahkan protection `requireRole("ADMIN")` ke `app/admin/layout.tsx` jika memungkinkan.
- Pastikan `app/admin/page.tsx` tetap fokus ke verifikasi apoteker.

Acceptance criteria:

- `/admin` tetap berfungsi.
- `/admin/obat` memakai shell admin.
- Tidak ada bottom nav mobile di admin.
- Sidebar admin active state benar.

## Fase 6 - Admin CMS List Obat

Tujuan: admin bisa melihat dan memfilter semua informasi obat.

Buat:

- `app/admin/obat/page.tsx`

Query param:

- `q`
- `page`
- `status`
- `demo`

Status filter:

- `ALL`
- `DRAFT`
- `PUBLISHED`

Demo filter:

- `ALL`
- `DEMO`
- `PRODUCTION`

UI:

- Header: `Informasi Obat`
- Button: `Tambah Obat`
- Search input
- Filter status
- Filter demo/produksi
- Table

Kolom table:

- Nama generik
- Merek
- Status
- Demo/Produksi
- Reviewer
- Tanggal review
- Review ulang
- Terakhir diubah
- Aksi

Aksi:

- `Edit`
- `Preview publik` jika status published

Acceptance criteria:

- Admin bisa melihat draft dan published.
- Pagination bekerja.
- Filter status bekerja.
- Filter demo bekerja.
- Search bekerja.

## Fase 7 - Admin Create/Edit Form

Tujuan: admin bisa membuat dan mengubah konten obat.

Routes:

- `app/admin/obat/new/page.tsx`
- `app/admin/obat/[id]/page.tsx`

Server actions:

- `app/actions/admin/save-drug.ts`
- `app/actions/admin/publish-drug.ts`

Form component:

- `components/admin/drug-form.tsx`

Gunakan tabs:

- `Dasar`
- `Publik`
- `Apoteker`
- `Review`

### Tab Dasar

Field:

- `genericName`
- `slug`
- `brandNames`
- `aliases`
- `drugClass`
- `dosageForm`
- `isDemo`
- `status`

Array input awal boleh berupa textarea satu item per baris atau input comma-separated. Pilih satu dan konsisten.

Rekomendasi MVP:

- Gunakan textarea satu item per baris untuk array.
- Lebih mudah untuk merek, alias, efek samping, dan referensi.

### Tab Publik

Field:

- `uses`
- `generalUsage`
- `foodGuidance`
- `commonSideEffects`
- `warnings`
- `seekHelpWhen`

### Tab Apoteker

Field:

- `pharmacistIndications`
- `counselingPoints`
- `screeningQuestions`
- `contraindications`
- `majorInteractions`
- `seriousSideEffects`
- `monitoringParameters`
- `referralCriteria`
- `internalNotes`
- `references`

### Tab Review

Field:

- `reviewerId`
- `reviewedAt`
- `reviewDueAt`

Reviewer list:

- Hanya user dengan `role: "PHARMACIST"` dan `pharmacistProfile.verificationStatus: "VERIFIED"`.

Validation minimal:

- `genericName` wajib.
- `slug` wajib dan unik.
- `uses` wajib.
- `generalUsage` wajib.
- `reviewerId` wajib untuk publish.
- `reviewedAt` wajib untuk publish.
- `status: PUBLISHED` hanya boleh jika reviewer verified.

Server action rules:

- Selalu panggil `requireRole("ADMIN")`.
- Jangan percaya hidden input untuk authorization.
- Trim semua string.
- Convert array textarea menjadi array string non-empty.
- Jika save sukses, redirect dengan success message.
- Jika error, redirect dengan error message.

Toast:

- Jika form dibuat client component, gunakan `react-hot-toast`.
- Jika tetap server form sederhana, gunakan `AppMessage` dari query param.
- Jangan tambah library toast baru.

Acceptance criteria:

- Admin bisa membuat draft obat.
- Admin bisa edit draft.
- Admin bisa publish hanya dengan reviewer verified dan reviewedAt.
- Slug duplicate ditangani dengan pesan error Bahasa Indonesia.
- Field array tersimpan sebagai array bersih tanpa item kosong.

## Fase 8 - Preview dan Publish/Unpublish

Tujuan: admin bisa memastikan konten sebelum tampil publik.

Preview:

- Untuk published, link ke `/obat/[slug]`.
- Untuk draft, buat preview admin read-only di `/admin/obat/[id]?preview=public` atau tampilkan preview dalam page edit.

Publish:

- Button `Terbitkan`
- Button `Jadikan Draft`

Rules:

- Publish membutuhkan reviewer verified.
- Publish membutuhkan reviewedAt.
- Unpublish mengubah status ke `DRAFT`.
- Jangan hapus data obat pada MVP.

Acceptance criteria:

- Published tampil di publik jika reviewer verified.
- Draft tidak tampil di publik.
- Draft tetap tampil di admin.
- Unpublish langsung menghilangkan obat dari publik.

## Fase 9 - Hardening dan Tests

Tambahkan atau update test untuk pure utility:

- parsing page param
- parsing array textarea
- slug normalization jika dibuat helper

Jangan wajibkan test database pada MVP jika project belum punya test DB.

Manual verification checklist:

- `/obat` page 1
- `/obat?page=2`
- `/obat?q=para`
- `/dashboard/obat`
- `/pharmacist/dashboard/obat`
- `/pharmacist/dashboard/obat/[slug]`
- `/admin`
- `/admin/obat`
- `/admin/obat/new`
- `/admin/obat/[id]`

Allowed commands:

```powershell
bun.cmd run typecheck
bun.cmd test lib\drug-search.test.ts
bun.cmd x prisma validate
```

Do not run without explicit permission:

```powershell
bun.cmd run build
bun.cmd run lint
bun.cmd run dev
bun.cmd x prisma migrate dev
bun.cmd x prisma generate
```

## Suggested File Checklist

New files likely needed:

- `DOCS/PLAN_INFORMASI_OBAT_MODE_APOTEKER_ADMIN.md`
- `components/admin-dashboard-shell.tsx`
- `components/admin/drug-form.tsx`
- `components/drugs/pharmacist-drug-detail.tsx`
- `app/admin/layout.tsx`
- `app/admin/obat/page.tsx`
- `app/admin/obat/new/page.tsx`
- `app/admin/obat/[id]/page.tsx`
- `app/actions/admin/save-drug.ts`
- `app/actions/admin/publish-drug.ts`
- `app/pharmacist/dashboard/obat/page.tsx`
- `app/pharmacist/dashboard/obat/[slug]/page.tsx`
- new Prisma migration folder for pharmacist/admin drug fields

Existing files likely changed:

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `lib/drugs.ts`
- `components/drugs/drug-list.tsx`
- `components/user-dashboard-shell.tsx`
- `app/obat/page.tsx`
- `app/(dashboard)/dashboard/obat/page.tsx`
- `app/admin/page.tsx`

## Implementation Order Summary

1. Pagination for public and patient list.
2. Database fields for pharmacist mode.
3. Data helpers split by public/pharmacist/admin.
4. Pharmacist dashboard list and detail.
5. Admin shell without mobile bottom nav.
6. Admin CMS list.
7. Admin create/edit form.
8. Publish/unpublish workflow.
9. Hardening, tests, and manual verification.

## Definition of Done

Implementation is done when:

- Public users see only public-safe drug content.
- Patient dashboard sees the same public-safe drug content.
- Pharmacists can access detailed read-only professional drug content.
- Admin can list, create, edit, publish, and unpublish drug content.
- Admin layout does not include bottom nav mobile.
- Pagination works on public, patient, pharmacist, and admin list pages.
- Draft content never appears publicly.
- Published content appears publicly only when reviewer is verified.
- Typecheck passes.
- Prisma schema validates.
- Existing unit tests pass.
