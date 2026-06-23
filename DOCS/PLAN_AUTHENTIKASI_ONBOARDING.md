# PLAN: Fitur 0 - Autentikasi & Onboarding Dasar

## Tujuan

Bangun fondasi akun sebelum fitur chat konseling dibuat. Setelah fitur ini selesai, aplikasi harus bisa membedakan user masyarakat, apoteker, dan admin.

Hasil akhir yang wajib ada:

- Masyarakat bisa registrasi, login, logout, dan mengisi profil kesehatan dasar.
- Apoteker bisa registrasi lewat form khusus dan menunggu verifikasi admin.
- Admin bisa memverifikasi apoteker.
- Halaman yang butuh login tidak bisa diakses oleh guest.
- Apoteker yang belum diverifikasi tidak tampil di list publik.

## Prerequisite

- `PLAN_SETUP_FONDASI_TEKNIS.md` sudah selesai.
- Landing page dasar sudah ada atau minimal ada footer yang bisa diberi CTA.
- Sistem punya tempat untuk menyimpan akun, role, profil masyarakat, dan profil apoteker.
- Fitur chat belum boleh dibuka sebelum auth guard tersedia.

## Role Access

**Guest**

- Bisa membuka landing page.
- Bisa membuka halaman login.
- Bisa membuka halaman registrasi masyarakat.
- Bisa membuka halaman registrasi apoteker dari CTA footer.
- Tidak bisa membuka chat, profil, dashboard apoteker, atau dashboard admin.

**Masyarakat**

- Bisa membuka Beranda.
- Bisa mengisi dan mengedit profil kesehatan.
- Bisa melihat list apoteker setelah fitur chat dibuat.
- Bisa memulai chat setelah fitur chat dibuat.
- Tidak bisa membuka dashboard apoteker atau dashboard admin.

**Apoteker**

- Bisa login ke dashboard apoteker.
- Bisa mengisi dan mengedit profil profesional.
- Bisa mengatur status ketersediaan.
- Tidak tampil di list publik sebelum status verifikasi `Terverifikasi`.

**Admin**

- Bisa membuka dashboard admin.
- Bisa melihat daftar user.
- Bisa melihat daftar pendaftaran apoteker.
- Bisa menyetujui, menolak, atau meminta revisi pendaftaran apoteker.

## State/Status

**Status Akun**

- `Aktif`: akun bisa login dan memakai fitur sesuai role.
- `Nonaktif`: akun tidak bisa memakai fitur.

**Status Verifikasi Apoteker**

- `Menunggu Verifikasi`: apoteker sudah submit form, admin belum review.
- `Terverifikasi`: apoteker sudah disetujui admin dan boleh tampil publik.
- `Ditolak`: pendaftaran apoteker ditolak admin.
- `Perlu Revisi`: data apoteker kurang lengkap dan perlu diperbaiki.

**Status Ketersediaan Apoteker**

- `Online`: apoteker tersedia untuk chat.
- `Offline`: apoteker tidak tersedia.

## Halaman yang Dibuat

### Landing Page Footer

Yang harus tampil:

- Link atau tombol `Daftar sebagai Apoteker`.
- Tombol mengarah ke halaman registrasi apoteker.

Behavior:

- Saat tombol diklik, guest diarahkan ke form registrasi apoteker.
- CTA ini tidak perlu tampil besar di hero. Footer cukup untuk MVP.

### Register Masyarakat

Yang harus tampil:

- Judul halaman: `Daftar Akun`.
- Form registrasi masyarakat.
- Link ke halaman login.
- Pesan error jika input tidak valid.

Field wajib:

- Nama lengkap.
- Email atau nomor WhatsApp.
- Password.
- Konfirmasi password.

Validasi sederhana:

- Nama tidak boleh kosong.
- Email atau nomor WhatsApp tidak boleh kosong.
- Password minimal 8 karakter.
- Konfirmasi password harus sama dengan password.
- Email atau nomor WhatsApp tidak boleh sudah dipakai akun lain.

Behavior:

- Saat submit berhasil, buat akun dengan role `Masyarakat`.
- Setelah submit berhasil, user langsung login otomatis dan diarahkan ke Beranda.
- Jika gagal, tampilkan pesan error yang mudah dipahami.

### Register Apoteker

Yang harus tampil:

- Judul halaman: `Daftar sebagai Apoteker`.
- Penjelasan singkat bahwa akun perlu diverifikasi admin sebelum tampil di publik.
- Form registrasi apoteker.
- Link ke halaman login.

Field wajib:

- Nama lengkap.
- Email atau nomor WhatsApp.
- Password.
- Konfirmasi password.
- Gelar.
- Nomor STR.
- Foto profil.
- Bio singkat.
- Topik bantuan.
- Lokasi praktik.
- Jam layanan.
- Pengalaman singkat.
- Dokumen pendukung STR.

Validasi sederhana:

- Semua field wajib harus terisi.
- Password minimal 8 karakter.
- Konfirmasi password harus sama dengan password.
- Nomor STR tidak boleh kosong.
- Foto profil harus berupa gambar.
- Dokumen STR harus berupa gambar atau PDF.
- Email atau nomor WhatsApp tidak boleh sudah dipakai akun lain.

Behavior:

- Saat submit berhasil, buat akun dengan role `Apoteker`.
- Set status verifikasi menjadi `Menunggu Verifikasi`.
- Apoteker belum boleh tampil di list publik.
- Setelah submit berhasil, tampilkan halaman status dengan pesan: `Pendaftaran berhasil. Akun Anda menunggu verifikasi admin.`

### Login

Yang harus tampil:

- Form login.
- Link ke register masyarakat.
- Link kecil ke register apoteker.
- Pesan error jika login gagal.

Field wajib:

- Email atau nomor WhatsApp.
- Password.

Behavior:

- Jika login sukses, arahkan user sesuai role:
  - `Masyarakat` ke Beranda.
  - `Apoteker` ke Dashboard Apoteker.
  - `Admin` ke Dashboard Admin.
- Jika login gagal, tampilkan pesan error.
- Jika apoteker login tetapi status verifikasi belum `Terverifikasi`, tetap boleh masuk dashboard apoteker, tapi tampilkan status verifikasi.

### Profil Masyarakat

Yang harus tampil:

- Data akun.
- Form profil kesehatan.
- Tombol simpan.
- Tombol logout.

Field profil kesehatan:

- Umur atau tanggal lahir.
- Nomor HP.
- Jenis kelamin.
- Alamat.

Behavior:

- User bisa menyimpan profil walaupun belum semua data kesehatan lanjutan tersedia.
- Data profil ini akan dipakai sebagai Patient Snapshot pada fitur chat.

### Profil Apoteker

Yang harus tampil:

- Data akun.
- Status verifikasi.
- Status ketersediaan.
- Form profil profesional.
- Tombol simpan.
- Tombol logout.

Field profil profesional:

- Nama lengkap.
- Foto profil.
- Gelar.
- Bio singkat.
- Nomor STR.
- Topik bantuan.
- Lokasi praktik.
- Jam layanan.
- Pengalaman singkat.
- Dokumen pendukung STR.

Behavior:

- Apoteker bisa mengubah profil profesional.
- Jika data penting berubah setelah verifikasi, status boleh tetap `Terverifikasi` untuk MVP.
- Apoteker bisa mengubah status ketersediaan: `Online`, `Offline`.

### Dashboard Admin - Verifikasi Apoteker

Yang harus tampil:

- Daftar pendaftaran apoteker.
- Filter status: `Menunggu Verifikasi`, `Terverifikasi`, `Ditolak`, `Perlu Revisi`.
- Detail data apoteker.
- Preview foto profil dan dokumen STR.
- Input catatan admin.
- Tombol `Setujui`, `Tolak`, dan `Minta Revisi`.

Behavior:

- Klik `Setujui`: status berubah menjadi `Terverifikasi`.
- Klik `Tolak`: status berubah menjadi `Ditolak`, catatan admin wajib diisi.
- Klik `Minta Revisi`: status berubah menjadi `Perlu Revisi`, catatan admin wajib diisi.
- Hanya apoteker `Terverifikasi` yang boleh tampil di list publik.

## Auth Guard

Aturan akses:

- Guest yang membuka halaman chat diarahkan ke login.
- Guest yang membuka profil diarahkan ke login.
- Masyarakat yang membuka dashboard apoteker diarahkan ke Beranda.
- Masyarakat atau apoteker yang membuka dashboard admin diarahkan ke Beranda.
- Admin boleh membuka dashboard admin.
- Apoteker boleh membuka dashboard apoteker.

## Acceptance Criteria

- Guest bisa membuka login, register masyarakat, dan register apoteker.
- User masyarakat bisa registrasi dan langsung masuk Beranda.
- User bisa login dan logout.
- Session tetap aktif setelah refresh.
- Guest tidak bisa membuka halaman yang membutuhkan login.
- Apoteker bisa registrasi lewat CTA footer landing page.
- Registrasi apoteker menghasilkan status `Menunggu Verifikasi`.
- Admin bisa approve, reject, dan minta revisi pendaftaran apoteker.
- Apoteker `Terverifikasi` bisa tampil publik.
- Apoteker yang belum `Terverifikasi` tidak tampil publik.
- Apoteker bisa mengubah status ketersediaan.

## Test Scenario

- Register masyarakat dengan data valid, lalu pastikan user masuk Beranda.
- Register masyarakat dengan password tidak sama, lalu pastikan muncul error.
- Register apoteker dari CTA footer, lalu pastikan status `Menunggu Verifikasi`.
- Login sebagai masyarakat, refresh halaman, lalu pastikan session masih aktif.
- Logout, lalu coba buka halaman profil dan pastikan diarahkan ke login.
- Login sebagai apoteker pending, lalu pastikan dashboard menampilkan status verifikasi.
- Login sebagai admin, approve apoteker pending, lalu pastikan status menjadi `Terverifikasi`.
- Reject pendaftaran apoteker tanpa catatan, lalu pastikan sistem menolak aksi.
- Set apoteker menjadi `Online`, dan `Offline`, lalu pastikan status tersimpan.

## Assumptions

- Registrasi masyarakat dan registrasi apoteker memakai form berbeda.
- Registrasi masyarakat langsung login otomatis setelah submit sukses.
- Registrasi apoteker tidak langsung tampil publik.
- OTP, social login, SSO Class, dan permission matrix detail tidak dibuat di MVP.
- Data profil kesehatan dibuat sederhana dulu. Detail alergi, penyakit penyerta, dan obat rutin bisa ditambahkan pada fitur chat/reminder berikutnya.
