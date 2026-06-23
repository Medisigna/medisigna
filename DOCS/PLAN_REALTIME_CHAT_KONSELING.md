# PLAN: Fitur 1 - Realtime Chat Konseling Apoteker

## Tujuan

Bangun fitur chat realtime antara masyarakat dan apoteker. User harus bisa memilih apoteker yang tersedia, langsung masuk ruang chat, mengirim pesan, upload foto obat/resep, lalu menerima ringkasan konseling dari apoteker.

Fitur ini harus mobile-first. Tampilan mobile menjadi prioritas utama. Desktop cukup usable.

## Prerequisite

- `PLAN_AUTHENTIKASI_ONBOARDING.md` sudah selesai.
- User masyarakat sudah bisa login.
- Apoteker sudah bisa login dan punya status verifikasi.
- Apoteker punya status ketersediaan: `Online`, `Sibuk`, `Offline`.
- Hanya apoteker `Terverifikasi` yang boleh tampil di list publik.

## Role Access

**Guest**

- Tidak bisa membuka chat.
- Jika mencoba chat, arahkan ke login.

**Masyarakat**

- Bisa melihat list apoteker terverifikasi.
- Bisa membuka detail apoteker.
- Bisa memulai chat dengan apoteker `Online`.
- Bisa mengirim pesan teks.
- Bisa upload foto obat/resep.
- Bisa melihat riwayat chat sendiri.

**Apoteker**

- Bisa melihat chat aktif yang masuk ke dirinya.
- Bisa membalas pesan.
- Bisa melihat Patient Snapshot user.
- Bisa membuat ringkasan konseling.
- Bisa menutup sesi chat.

**Admin**

- Bisa melihat daftar sesi chat untuk audit/support.
- Tidak perlu ikut membalas chat pada MVP.

## State/Status

**Status Apoteker**

- `Online`: tombol chat aktif.
- `Sibuk`: tombol chat tidak aktif atau tampil sebagai `Sedang Sibuk`.
- `Offline`: tombol chat tidak aktif.

**Status Sesi Chat**

- `Aktif`: chat sedang berjalan.
- `Menunggu User`: apoteker sudah membalas dan menunggu respon user.
- `Menunggu Apoteker`: user sudah mengirim pesan dan menunggu apoteker.
- `Selesai`: apoteker sudah membuat ringkasan dan menutup sesi.
- `Dirujuk ke Faskes`: apoteker menilai user perlu ke dokter/faskes.
- `Dibatalkan`: sesi dibatalkan oleh user, apoteker, atau admin.

**Jenis Pesan**

- `Text`: pesan teks biasa.
- `Image`: foto obat, resep, atau dokumen kesehatan.
- `System`: pesan otomatis dari sistem.
- `Summary`: ringkasan konseling dari apoteker.

## Halaman yang Dibuat

### List Apoteker

Yang harus tampil:

- Judul halaman: `Pilih Apoteker`.
- List apoteker `Terverifikasi`.
- Filter status sederhana: `Semua`, `Online`, `Sibuk`, `Offline`.
- Card apoteker.

Isi card apoteker:

- Foto.
- Nama.
- Gelar.
- Status ketersediaan.
- Topik bantuan.
- Bio singkat maksimal 2 baris.
- Tombol `Chat`.

Behavior:

- Apoteker `Online`: tombol `Chat` aktif.
- Apoteker `Sibuk`: tombol disabled dengan teks `Sedang Sibuk`.
- Apoteker `Offline`: tombol disabled dengan teks `Offline`.
- Klik card membuka detail apoteker.
- Hanya apoteker `Terverifikasi` yang tampil.

### Detail Apoteker

Yang harus tampil:

- Foto.
- Nama.
- Gelar.
- Status ketersediaan.
- Bio.
- Topik bantuan.
- Lokasi praktik.
- Jam layanan.
- Pengalaman singkat.
- Badge `Terverifikasi`.
- Tombol `Mulai Chat`.

Behavior:

- Tombol `Mulai Chat` aktif hanya jika apoteker `Online`.
- Jika user belum login, tombol mengarah ke login.
- Jika apoteker `Sibuk` atau `Offline`, tampilkan pesan bahwa apoteker belum tersedia.

### Chat Room Masyarakat

Yang harus tampil:

- Header berisi nama apoteker, foto kecil, dan status.
- Area pesan dengan bubble chat.
- Input pesan teks.
- Tombol upload foto.
- Tombol kirim.
- Indikator status sesi.

Behavior:

- Saat chat baru dibuat, sistem otomatis mengirim welcome message.
- Welcome message: `Halo, kamu terhubung dengan Apt. [Nama]. Silakan tulis pertanyaan atau upload foto obat/resep. Apoteker akan menanyakan data tambahan jika diperlukan.`
- User bisa mengirim pesan teks.
- User bisa upload foto obat/resep.
- Pesan baru muncul tanpa refresh halaman.
- Jika sesi sudah `Selesai`, input pesan dinonaktifkan.
- Jika apoteker menutup sesi, ringkasan konseling tampil sebagai kartu khusus.

### Dashboard Apoteker - Chat

Yang harus tampil:

- Tab `Chat Aktif`.
- Tab `Selesai`.
- List chat dengan nama user, pesan terakhir, waktu terakhir, dan status.
- Detail chat saat sesi dipilih.
- Patient Snapshot.
- Form ringkasan konseling.

Behavior:

- Apoteker bisa membuka chat aktif.
- Apoteker bisa membalas pesan.
- Apoteker bisa melihat Patient Snapshot di sisi/detail chat.
- Apoteker bisa membuat ringkasan konseling.
- Setelah ringkasan disimpan, apoteker bisa menandai sesi `Selesai`.

### Patient Snapshot

Yang harus tampil:

- Nama user.
- Umur atau tanggal lahir.
- Nomor HP.
- Jenis kelamin.
- Alamat.
- Catatan jika data profil belum lengkap.

Behavior:

- Snapshot hanya dibaca apoteker.
- Jika data belum lengkap, tampilkan `Belum diisi`.
- Apoteker tetap bisa bertanya langsung di chat jika data kurang.

### Ringkasan Konseling

Field wajib:

- Masalah utama.
- Edukasi apoteker.
- Peringatan.
- Saran tindak lanjut.
- Status akhir.

Status akhir:

- `Selesai`.
- `Dirujuk ke Faskes`.

Behavior:

- Ringkasan hanya bisa dibuat oleh apoteker.
- Setelah ringkasan dibuat, tampilkan sebagai kartu di chat user.
- Setelah sesi selesai, chat masuk ke riwayat.

### Riwayat Chat

Yang harus tampil:

- List sesi chat user.
- Nama apoteker.
- Status akhir.
- Tanggal sesi.
- Preview ringkasan jika ada.

Behavior:

- User hanya bisa melihat riwayat miliknya sendiri.
- Klik riwayat membuka detail chat read-only jika sesi sudah selesai.

## Field Form

**Kirim Pesan**

- Isi pesan: wajib jika tidak ada foto.
- Foto: opsional jika ada isi pesan, wajib jika isi pesan kosong.

Validasi:

- Tidak boleh mengirim pesan kosong.
- File upload hanya gambar untuk MVP.
- Jika upload gagal, tampilkan error dan jangan kirim pesan.

**Ringkasan Konseling**

- Masalah utama: wajib.
- Edukasi apoteker: wajib.
- Peringatan: wajib.
- Saran tindak lanjut: wajib.
- Status akhir: wajib.

Validasi:

- Semua field wajib harus terisi.
- Status akhir hanya boleh `Selesai` atau `Dirujuk ke Faskes`.

## Behavior Utama

- User tidak mengisi form intake sebelum chat.
- Apoteker yang bertanya langsung jika data pasien kurang.
- Sistem memakai data profil user sebagai Patient Snapshot.
- Chat baru hanya bisa dibuat dengan apoteker `Online`.
- Satu user boleh punya lebih dari satu sesi chat, tapi tidak perlu membatasi jumlah sesi pada MVP.
- Realtime berarti pesan muncul tanpa refresh halaman.
- Jika teknologi realtime belum siap, fallback MVP boleh polling berkala, selama user tidak perlu refresh manual.

## Acceptance Criteria

- Guest yang klik chat diarahkan ke login.
- User login bisa melihat list apoteker terverifikasi.
- Apoteker belum terverifikasi tidak tampil di list publik.
- Apoteker `Online` punya tombol chat aktif.
- Apoteker `Sibuk` dan `Offline` tidak bisa menerima chat baru.
- User bisa membuat sesi chat dengan apoteker online.
- Sistem mengirim welcome message otomatis saat sesi dibuat.
- User bisa mengirim pesan teks.
- User bisa upload foto obat/resep.
- Apoteker bisa membaca dan membalas pesan.
- Apoteker bisa melihat Patient Snapshot.
- Apoteker bisa membuat ringkasan konseling.
- Setelah ringkasan dibuat, sesi bisa ditandai selesai.
- User bisa melihat ringkasan dan riwayat chat.

## Test Scenario

- Guest membuka detail apoteker lalu klik chat, pastikan diarahkan ke login.
- User login membuka list apoteker, pastikan hanya apoteker `Terverifikasi` yang tampil.
- Apoteker `Online` tampil dengan tombol `Chat` aktif.
- Apoteker `Sibuk` tampil dengan tombol disabled.
- Apoteker `Offline` tampil dengan tombol disabled.
- User klik `Chat` ke apoteker online, pastikan chat room dibuat.
- Saat chat room dibuat, pastikan welcome message muncul.
- User kirim pesan teks, pastikan pesan tampil di chat apoteker.
- User upload foto resep, pastikan foto tampil di chat apoteker.
- Apoteker membalas pesan, pastikan pesan tampil di chat user.
- Apoteker membuka Patient Snapshot, pastikan data profil user tampil.
- Apoteker membuat ringkasan konseling, pastikan kartu ringkasan tampil di chat user.
- Apoteker menandai sesi selesai, pastikan input chat user dinonaktifkan.
- User membuka riwayat, pastikan sesi selesai muncul.

## Assumptions

- Konseling gratis selama MVP.
- User tidak wajib mengisi form intake sebelum chat.
- Patient Snapshot berasal dari profil masyarakat yang sudah dibuat di fitur auth.
- Upload file MVP hanya gambar.
- Voice call, video call, rating, pembayaran, auto matching, dan bot klinis tidak dibuat di fitur ini.
- Reminder obat dari chat dibuat di fitur berikutnya.
