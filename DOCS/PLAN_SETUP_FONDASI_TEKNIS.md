# PLAN: Fitur -1 - Setup Fondasi Teknis

## Tujuan

Siapkan fondasi teknis sebelum fitur autentikasi, onboarding, dan chat dibuat. Setelah setup ini selesai, project harus punya env contract, schema database awal, client database, konfigurasi auth dasar, dan struktur folder yang jelas.

Setup ini belum membuat fitur UI lengkap. Fokusnya hanya memastikan project siap dipakai oleh implementer berikutnya.

## Prerequisite

- Project memakai Next.js, Prisma, Better Auth, PostgreSQL, dan Bun.
- Jangan memakai Drizzle untuk project ini.
- Jangan menambah service eksternal baru kecuali sudah ada di package/project.
- Jangan menjalankan command yang mengubah database production.

## Struktur File yang Dibuat

Minimal file/folder yang perlu disiapkan:

- `.env.example`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `lib/env.ts`
- `lib/db.ts`
- `lib/auth.ts`
- `app/api/auth/[...all]/route.ts`
- `DOCS/PLAN_SETUP_FONDASI_TEKNIS.md`

Jika folder belum ada, buat foldernya. Jika file sudah ada, update seperlunya tanpa menghapus konfigurasi yang masih dipakai.

## Env Contract

### `.env.example`

Isi minimal:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `UPLOAD_MAX_SIZE_MB`

Isi opsional untuk fitur berikutnya:

- `PUSH_NOTIFICATION_PUBLIC_KEY`
- `PUSH_NOTIFICATION_PRIVATE_KEY`
- `STORAGE_PROVIDER`
- `STORAGE_BUCKET`
- `STORAGE_ACCESS_KEY`
- `STORAGE_SECRET_KEY`

Behavior:

- `.env.example` hanya berisi contoh value, bukan secret asli.
- `.env` lokal tidak perlu dibuat oleh implementer jika sudah ada.
- Semua env yang dipakai app harus didaftarkan di `lib/env.ts`.

### `lib/env.ts`

Yang harus dilakukan:

- Validasi env server.
- Pisahkan env wajib dan opsional.
- Jika env wajib kosong, app harus error dengan pesan yang jelas.
- Jangan membaca `process.env` langsung di banyak tempat. Gunakan helper env ini.

Env wajib:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Env opsional:

- Env upload/storage.
- Env push notification.

## Prisma Setup

### `prisma.config.ts`

Yang harus dilakukan:

- Arahkan schema ke `prisma/schema.prisma`.
- Arahkan migrations ke `prisma/migrations`.
- Pakai `DATABASE_URL` dari env.
- Pastikan config cocok dengan Prisma 7.

### `prisma/schema.prisma`

Schema awal harus mencakup 3 kelompok:

**Better Auth**

- `User`
- `Session`
- `Account`
- `Verification`

**Profil & Role Medisigna**

- Role user: `Masyarakat`, `Apoteker`, `Admin`.
- Profil masyarakat.
- Profil apoteker.
- Status verifikasi apoteker.
- Status ketersediaan apoteker.

**Fondasi Chat**

- Chat session.
- Chat message.
- Chat attachment.
- Konseling summary.

Catatan:

- Schema chat boleh dibuat di setup ini agar auth dan chat plan tidak saling menebak.
- Jangan implement UI chat pada setup ini.
- Gunakan nama field Bahasa Inggris di database.
- Gunakan status enum yang sudah ditulis di plan auth dan chat.

### Data Minimal yang Harus Ada

`User`

- id
- name
- email atau phone
- role
- account status
- createdAt
- updatedAt

`PatientProfile`

- userId
- birthDate atau age
- phone
- gender
- address

`PharmacistProfile`

- userId
- title
- strNumber
- profilePhotoUrl
- bio
- topics
- practiceLocation
- serviceHours
- experienceSummary
- strDocumentUrl
- verificationStatus
- availabilityStatus
- adminNote

`ConsultationSession`

- patientId
- pharmacistId
- status
- startedAt
- endedAt

`ConsultationMessage`

- sessionId
- senderId
- type
- body
- createdAt

`ConsultationAttachment`

- messageId
- fileUrl
- fileType
- fileName

`ConsultationSummary`

- sessionId
- mainProblem
- education
- warning
- followUpAdvice
- finalStatus
- createdBy

## Database Client

### `lib/db.ts`

Yang harus dilakukan:

- Buat Prisma client singleton.
- Hindari membuat Prisma client baru di setiap request saat development.
- Semua query database nantinya harus memakai helper ini.

Behavior:

- Di development, reuse client agar hot reload tidak membuka banyak koneksi.
- Di production, client tetap aman dipakai oleh route/server action.

## Better Auth Setup

### `lib/auth.ts`

Yang harus dilakukan:

- Setup Better Auth dengan Prisma adapter.
- Aktifkan email/password login.
- Hubungkan ke Prisma client dari `lib/db.ts`.
- Gunakan `BETTER_AUTH_SECRET` dan `BETTER_AUTH_URL`.

Behavior:

- Auth menghasilkan session.
- Session bisa dibaca di server.
- User role harus bisa dipakai untuk auth guard di fitur berikutnya.

### `app/api/auth/[...all]/route.ts`

Yang harus dilakukan:

- Expose handler Better Auth untuk Next.js.
- Pastikan route auth bisa dipakai oleh halaman login/register nanti.

## Upload Foundation

Setup upload belum perlu storage production penuh. Namun schema dan env harus siap.

MVP behavior:

- Upload foto profil apoteker.
- Upload dokumen STR.
- Upload foto obat/resep di chat.

Aturan awal:

- File gambar untuk foto profil dan foto chat.
- File gambar atau PDF untuk dokumen STR.
- Simpan URL file di database.
- Jika storage belum siap, implementer boleh pakai placeholder local/public hanya untuk development.

## Scripts

Pastikan `package.json` punya script minimal:

- `typecheck`
- `db:generate`
- `db:migrate`
- `db:push`
- `db:studio`

Catatan:

- Gunakan Bun untuk package/script command.
- Jangan tambahkan script lint baru.
- Jangan menjalankan migration ke database production.

## Behavior Utama

- App tidak boleh berjalan tanpa env wajib.
- Database schema harus mendukung auth, profil, verifikasi apoteker, dan chat session.
- Auth setup harus siap dipakai oleh plan autentikasi.
- Chat schema harus siap dipakai oleh plan chat.
- Setup ini tidak membuat UI login, UI register, atau UI chat.

## Acceptance Criteria

- `.env.example` tersedia dan mencantumkan env wajib.
- `lib/env.ts` memvalidasi env wajib.
- Prisma config tersedia.
- Prisma schema tersedia untuk auth, profil, apoteker, chat, attachment, dan summary.
- Prisma client tersedia lewat `lib/db.ts`.
- Better Auth config tersedia lewat `lib/auth.ts`.
- API route Better Auth tersedia.
- Package scripts database tersedia.
- Typecheck project tetap pass setelah setup.

## Test Scenario

- Jalankan typecheck dan pastikan tidak ada error TypeScript.
- Kosongkan salah satu env wajib di local test, pastikan error env muncul jelas.
- Generate Prisma client, pastikan schema valid.
- Buka Prisma Studio pada database local, pastikan model utama muncul.
- Test route auth secara minimal, pastikan handler tersedia.
- Pastikan schema punya field yang dibutuhkan oleh plan auth dan chat.

## Assumptions

- Project memakai Prisma, bukan Drizzle.
- PostgreSQL dipakai sebagai database utama.
- Better Auth dipakai untuk autentikasi.
- Upload production boleh disiapkan nanti, tapi field dan env-nya disiapkan sekarang.
- Push notification belum dibuat di setup ini.
- Realtime transport chat belum dibuat di setup ini.
