# PLAN TEKNIS: Fitur Realtime Chat Konseling Apoteker

Dokumen ini adalah instruksi implementasi. Ikuti urutan fase. Jangan lompat ke WebSocket/SSE sebelum polling MVP selesai.

## Target MVP

User pasien bisa:

- melihat apoteker terverifikasi,
- membuka detail apoteker,
- memulai sesi chat dengan apoteker online,
- mengirim pesan teks,
- upload gambar obat/resep,
- melihat balasan tanpa refresh manual,
- melihat ringkasan konseling saat sesi ditutup.

Apoteker bisa:

- melihat daftar sesi miliknya,
- membuka chat,
- membalas pesan,
- melihat patient snapshot,
- membuat ringkasan,
- menutup sesi sebagai `COMPLETED` atau `REFERRED`.

Admin cukup bisa audit lewat data yang sudah tersimpan. UI admin untuk chat tidak wajib MVP.

## Batasan Implementasi

- Gunakan polling 2-3 detik untuk MVP realtime.
- Jangan buat WebSocket/SSE dulu.
- Jangan tambah dependency realtime.
- Jangan tambah table baru kecuali schema yang ada terbukti tidak cukup.
- Gunakan model Prisma yang sudah ada:
  - `ConsultationSession`
  - `ConsultationMessage`
  - `ConsultationAttachment`
  - `ConsultationSummary`
- Gunakan enum yang sudah ada:
  - `ConsultationSessionStatus`
  - `ConsultationMessageType`
  - `ConsultationFinalStatus`
  - `PharmacistAvailabilityStatus`
  - `PharmacistVerificationStatus`

## Route yang Dibuat/Diubah

### Pasien

1. `app/(dashboard)/dashboard/pharmacists/page.tsx`
   - Ubah dari list sederhana menjadi list apoteker terverifikasi.
   - Query hanya `verificationStatus: "VERIFIED"`.
   - Tambahkan filter query param opsional:
     - `?status=all`
     - `?status=online`
     - `?status=offline`
   - Tombol chat:
     - `ONLINE`: aktif, submit ke server action start session.
     - `OFFLINE`: disabled, teks `Offline`.

2. `app/(dashboard)/dashboard/pharmacists/[id]/page.tsx`
   - Buat halaman detail apoteker.
   - Ambil `PharmacistProfile` berdasarkan `id`.
   - Jika tidak ada atau bukan `VERIFIED`, panggil `notFound()`.
   - Tombol `Mulai Chat` memakai server action start session.

3. `app/(dashboard)/dashboard/chat/page.tsx`
   - Ubah menjadi daftar chat pasien.
   - Tampilkan sesi milik pasien login.
   - Urutkan `updatedAt desc`.
   - Klik item menuju `/dashboard/chat/[sessionId]`.

4. `app/(dashboard)/dashboard/chat/[sessionId]/page.tsx`
   - Chat room pasien.
   - Server component untuk validasi akses dan render shell.
   - User hanya boleh membuka session dengan `patientId === currentUser.id`.
   - Pass initial session + messages ke client component.

### Apoteker

1. `app/pharmacist/dashboard/chat/page.tsx`
   - Buat dashboard chat apoteker.
   - Query sesi dengan `pharmacistId === currentUser.id`.
   - Pisah tab:
     - aktif: `ACTIVE`, `WAITING_USER`, `WAITING_PHARMACIST`
     - selesai: `COMPLETED`, `REFERRED`, `CANCELED`

2. `app/pharmacist/dashboard/chat/[sessionId]/page.tsx`
   - Detail chat apoteker.
   - Apoteker hanya boleh membuka session dengan `pharmacistId === currentUser.id`.
   - Tampilkan chat, patient snapshot, dan form ringkasan.

## Komponen yang Dibuat

### Shared Chat UI

Lokasi: `components/consultation/`

1. `chat-room.tsx`
   - Client component.
   - Props:
     - `sessionId`
     - `currentUserId`
     - `currentUserRole`
     - `initialMessages`
     - `sessionStatus`
   - State:
     - `messages`
     - `isSending`
     - `text`
     - `file`
   - Polling:
     - `setInterval(fetchMessages, 2500)`
     - berhenti saat component unmount.
     - tetap polling meski session selesai agar summary terakhir muncul.
   - Render:
     - list bubble pesan,
     - input teks,
     - input file gambar,
     - tombol kirim.
   - Disable input jika session status final:
     - `COMPLETED`
     - `REFERRED`
     - `CANCELED`

2. `message-bubble.tsx`
   - Props:
     - `message`
     - `isOwnMessage`
   - Tipe render:
     - `TEXT`: bubble teks.
     - `IMAGE`: bubble gambar + caption opsional.
     - `SYSTEM`: centered muted text.
     - `SUMMARY`: card ringkasan.

3. `session-list.tsx`
   - Render daftar sesi untuk pasien/apoteker.
   - Input data sudah diformat dari server component.

4. `patient-snapshot.tsx`
   - Render data profil pasien.
   - Jika kosong tampilkan `Belum diisi`.

5. `summary-form.tsx`
   - Form apoteker.
   - Submit ke `saveConsultationSummary`.
   - Field wajib:
     - `mainProblem`
     - `education`
     - `warning`
     - `followUpAdvice`
     - `finalStatus`

## Server Actions

Lokasi: `app/actions/consultation/`

### `start-session.ts`

Export: `startConsultationSession(pharmacistProfileId: string)`

Langkah:

1. Ambil user pasien dengan `requireRole("PATIENT")`.
2. Cari `PharmacistProfile`:
   - `id === pharmacistProfileId`
   - `verificationStatus === "VERIFIED"`
   - include `user`
3. Jika tidak ada, return error atau `notFound`.
4. Jika `availabilityStatus !== "ONLINE"`, return error `Apoteker sedang offline.`
5. Buat `ConsultationSession` dengan:
   - `patientId: currentUser.id`
   - `pharmacistId: pharmacistProfile.userId`
   - `status: "ACTIVE"`
6. Buat welcome `ConsultationMessage` dalam transaction yang sama:
   - `sessionId`
   - `senderId: pharmacistProfile.userId`
   - `type: "SYSTEM"`
   - `body: Halo, kamu terhubung dengan Apt. [Nama]. Silakan tulis pertanyaan atau upload foto obat/resep. Apoteker akan menanyakan data tambahan jika diperlukan.`
7. Redirect ke `/dashboard/chat/${session.id}`.

Gunakan `db.$transaction`.

### `send-message.ts`

Export: `sendConsultationMessage(formData: FormData)`

Input:

- `sessionId`
- `body`
- `image` opsional

Langkah:

1. Ambil session user:
   - pasien boleh jika `session.patientId === currentUser.id`
   - apoteker boleh jika `session.pharmacistId === currentUser.id`
2. Tolak jika status final:
   - `COMPLETED`
   - `REFERRED`
   - `CANCELED`
3. Validasi:
   - `body.trim()` tidak kosong atau ada image.
   - image hanya `image/jpeg`, `image/png`, `image/webp`.
   - ukuran maksimal 5 MB.
4. Jika ada image:
   - simpan file lewat helper upload.
   - buat message type `IMAGE`.
   - buat `ConsultationAttachment`.
5. Jika tidak ada image:
   - buat message type `TEXT`.
6. Update status session:
   - jika sender pasien: `WAITING_PHARMACIST`
   - jika sender apoteker: `WAITING_USER`
7. Redirect tidak perlu. Return `{ ok: true }`.

### `save-summary.ts`

Export: `saveConsultationSummary(formData: FormData)`

Input:

- `sessionId`
- `mainProblem`
- `education`
- `warning`
- `followUpAdvice`
- `finalStatus`: `COMPLETED` atau `REFERRED`

Langkah:

1. Ambil user apoteker dengan `requireRole("PHARMACIST")`.
2. Cari session dengan:
   - `id === sessionId`
   - `pharmacistId === currentUser.id`
3. Tolak jika tidak ada.
4. Validasi semua field wajib.
5. Upsert `ConsultationSummary` berdasarkan `sessionId`.
6. Buat message type `SUMMARY` dengan body JSON string:
   - `mainProblem`
   - `education`
   - `warning`
   - `followUpAdvice`
   - `finalStatus`
7. Update session:
   - `status = finalStatus`
   - `endedAt = new Date()`
8. Return `{ ok: true }`.

### `cancel-session.ts`

Export: `cancelConsultationSession(sessionId: string)`

Langkah:

1. Current user harus pasien pemilik session atau apoteker pemilik session.
2. Tolak jika session sudah final.
3. Update:
   - `status: "CANCELED"`
   - `endedAt: new Date()`
4. Buat `SYSTEM` message: `Sesi dibatalkan.`

## API Route untuk Polling

### `app/api/consultation/sessions/[sessionId]/messages/route.ts`

Method: `GET`

Query param opsional:

- `after=<messageId>` atau `afterTime=<ISO string>`

Implementasi MVP paling sederhana:

1. Ambil current session user.
2. Validasi user adalah pasien/apoteker dalam session.
3. Query messages:
   - `where: { sessionId }`
   - include attachments
   - orderBy `createdAt asc`
4. Return JSON:

```ts
{
  session: {
    id: string
    status: string
  }
  messages: Array<{
    id: string
    senderId: string
    type: string
    body: string | null
    createdAt: string
    attachments: Array<{
      id: string
      fileUrl: string
      fileType: string
      fileName: string
    }>
  }>
}
```

Untuk MVP, boleh return semua messages setiap polling. Optimasi `afterTime` dibuat setelah jumlah pesan terasa berat.

## Upload File

Helper: `lib/consultation-upload.ts`

Fungsi:

```ts
export async function saveConsultationImage(file: File): Promise<{
  fileUrl: string
  fileType: string
  fileName: string
}>
```

MVP lokal:

- Simpan ke `public/uploads/consultations`.
- Nama file: `${Date.now()}-${crypto.randomUUID()}.${ext}`.
- Return `fileUrl` seperti `/uploads/consultations/name.webp`.

Catatan deployment:

- Jika target deploy serverless/Vercel, ganti helper ini ke object storage.
- Jangan ubah caller. Cukup ubah isi helper upload.

## Query Utama

### List Apoteker

```ts
db.pharmacistProfile.findMany({
  where: {
    verificationStatus: "VERIFIED",
    ...(statusFilter ? { availabilityStatus: statusFilter } : {}),
  },
  include: { user: true },
  orderBy: [
    { availabilityStatus: "asc" },
    { updatedAt: "desc" },
  ],
})
```

Mapping filter:

- `online` -> `ONLINE`
- `offline` -> `OFFLINE`
- `all` atau kosong -> tanpa filter status

### Session Pasien

```ts
db.consultationSession.findMany({
  where: { patientId: user.id },
  include: {
    pharmacist: { include: { pharmacistProfile: true } },
    messages: { orderBy: { createdAt: "desc" }, take: 1 },
    summary: true,
  },
  orderBy: { updatedAt: "desc" },
})
```

### Session Apoteker

```ts
db.consultationSession.findMany({
  where: { pharmacistId: user.id },
  include: {
    patient: { include: { patientProfile: true } },
    messages: { orderBy: { createdAt: "desc" }, take: 1 },
    summary: true,
  },
  orderBy: { updatedAt: "desc" },
})
```

### Detail Session

```ts
db.consultationSession.findUnique({
  where: { id: sessionId },
  include: {
    patient: { include: { patientProfile: true } },
    pharmacist: { include: { pharmacistProfile: true } },
    messages: {
      include: { attachments: true },
      orderBy: { createdAt: "asc" },
    },
    summary: true,
  },
})
```

Setelah query, validasi akses manual berdasarkan `patientId` atau `pharmacistId`.

## Status Transition

Gunakan aturan ini di server action, bukan di UI saja.

| Action | Role | From | To |
| --- | --- | --- | --- |
| start session | PATIENT | none | ACTIVE |
| patient sends message | PATIENT | ACTIVE, WAITING_USER, WAITING_PHARMACIST | WAITING_PHARMACIST |
| pharmacist sends message | PHARMACIST | ACTIVE, WAITING_USER, WAITING_PHARMACIST | WAITING_USER |
| pharmacist saves completed summary | PHARMACIST | ACTIVE, WAITING_USER, WAITING_PHARMACIST | COMPLETED |
| pharmacist saves referred summary | PHARMACIST | ACTIVE, WAITING_USER, WAITING_PHARMACIST | REFERRED |
| cancel session | PATIENT/PHARMACIST | ACTIVE, WAITING_USER, WAITING_PHARMACIST | CANCELED |

Final status:

- `COMPLETED`
- `REFERRED`
- `CANCELED`

Final status tidak boleh menerima pesan baru.

## Validasi Akses

Selalu validasi di server.

Pasien:

- `requireRole("PATIENT")`
- hanya session dengan `patientId === user.id`

Apoteker:

- `requireRole("PHARMACIST")`
- hanya session dengan `pharmacistId === user.id`
- summary hanya boleh dibuat apoteker pemilik session

Guest:

- route dashboard sudah perlu login.
- untuk public detail apoteker di luar dashboard, tombol chat arahkan ke `/login`.

## UI Detail

Gunakan copy Bahasa Indonesia.

### Chat Room Mobile

Layout:

- header sticky:
  - nama lawan chat,
  - status session,
  - tombol kembali.
- message list:
  - `flex flex-col gap-3`
  - bubble kanan untuk pesan sendiri.
  - bubble kiri untuk pesan lawan.
  - system message centered.
- composer sticky bottom:
  - textarea 1-4 baris,
  - file input gambar,
  - button kirim.

Jangan pakai table untuk chat.

### Ringkasan Card

Tampilkan field:

- Masalah utama
- Edukasi
- Peringatan
- Saran tindak lanjut
- Status akhir

Jika `finalStatus === "REFERRED"`, tampilkan badge `Dirujuk ke Faskes`.

## Error Handling

Server action return error string untuk validasi user-facing.

Pesan error minimal:

- `Apoteker sedang offline.`
- `Sesi tidak ditemukan.`
- `Kamu tidak punya akses ke sesi ini.`
- `Sesi sudah selesai.`
- `Pesan tidak boleh kosong.`
- `File harus berupa gambar.`
- `Ukuran gambar maksimal 5 MB.`
- `Ringkasan wajib diisi lengkap.`

Client:

- tampilkan toast loading/success/error untuk submit.
- jika polling gagal, jangan crash. Simpan error singkat atau diamkan dan coba polling berikutnya.

## Urutan Implementasi

### Fase 1: Session dan List Apoteker

1. Update list apoteker dengan filter online/offline.
2. Buat detail apoteker.
3. Buat `startConsultationSession`.
4. Pastikan session + welcome message terbentuk.
5. Redirect ke chat room.

Acceptance:

- user pasien bisa mulai chat dengan apoteker online.
- apoteker offline tidak bisa dibuatkan session.
- welcome message tersimpan.

### Fase 2: Chat Pasien

1. Buat route `/dashboard/chat/[sessionId]`.
2. Buat `ChatRoom`.
3. Buat API polling messages.
4. Buat `sendConsultationMessage` teks.
5. Polling menampilkan pesan baru tanpa refresh.

Acceptance:

- pasien bisa kirim pesan.
- pesan muncul lagi setelah reload.
- input disabled saat session final.

### Fase 3: Chat Apoteker

1. Buat `/pharmacist/dashboard/chat`.
2. Buat `/pharmacist/dashboard/chat/[sessionId]`.
3. Reuse `ChatRoom`.
4. Tambahkan patient snapshot.
5. Apoteker bisa balas pesan.

Acceptance:

- apoteker hanya melihat session miliknya.
- balasan apoteker muncul di chat pasien lewat polling.

### Fase 4: Upload Gambar

1. Buat helper `saveConsultationImage`.
2. Tambahkan validasi file di `sendConsultationMessage`.
3. Simpan attachment.
4. Render gambar di bubble.

Acceptance:

- pasien/apoteker bisa kirim gambar.
- gambar tampil di kedua sisi chat.
- file non-image ditolak.
- file lebih dari 5 MB ditolak.

### Fase 5: Ringkasan dan Tutup Sesi

1. Buat `summary-form`.
2. Buat `saveConsultationSummary`.
3. Render message `SUMMARY` sebagai card.
4. Set session final dan `endedAt`.
5. Disable composer.

Acceptance:

- apoteker bisa simpan ringkasan.
- user melihat kartu ringkasan.
- session pindah ke riwayat/selesai.
- pesan baru ditolak setelah final.

## Test Manual

Jalankan minimal skenario ini:

1. Pasien buka list apoteker, hanya `VERIFIED` tampil.
2. Filter `Online` hanya menampilkan `ONLINE`.
3. Pasien klik chat apoteker `OFFLINE`, harus ditolak.
4. Pasien klik chat apoteker `ONLINE`, session dibuat.
5. Welcome message muncul.
6. Pasien kirim pesan teks.
7. Apoteker membuka dashboard chat dan melihat pesan.
8. Apoteker balas pesan.
9. Pasien melihat balasan tanpa refresh manual.
10. Pasien upload gambar valid.
11. Upload PDF ditolak.
12. Upload gambar lebih dari 5 MB ditolak.
13. Apoteker melihat patient snapshot.
14. Apoteker simpan ringkasan `COMPLETED`.
15. Pasien melihat kartu ringkasan.
16. Composer pasien disabled.
17. Server action menolak pesan baru ke session final.
18. Pasien tidak bisa membuka session milik pasien lain.
19. Apoteker tidak bisa membuka session milik apoteker lain.

## Checklist Kode

- Semua akses session divalidasi di server.
- Semua submit mutation memakai server action.
- Polling API tidak mengembalikan session milik user lain.
- Query message selalu `orderBy createdAt asc`.
- Status final dicek sebelum membuat message.
- Upload file validasi MIME dan size.
- UI copy Bahasa Indonesia.
- Tidak ada dependency realtime baru.
- Tidak ada WebSocket/SSE di MVP.
- Tidak ada logic role hanya di client.

## Yang Tidak Dibuat di MVP

- WebSocket/SSE.
- Typing indicator.
- Read receipt.
- Push notification chat.
- Pembayaran.
- Rating apoteker.
- Auto matching apoteker.
- Bot klinis.
- Voice/video call.
- Reminder obat dari ringkasan.

Reminder dibuat di fitur berikutnya.
