# PRD Medisigna Web

## 1. Ringkasan

Medisigna Web adalah kanal akuisisi, edukasi, dan konsultasi awal yang mendorong masyarakat menggunakan aplikasi Medisigna untuk pengelolaan obat dan layanan lanjutan.

Web bukan pengganti aplikasi pasien. Web harus cukup berguna untuk membangun kepercayaan dan memberi pengalaman awal, tetapi fitur retensi dan penggunaan berulang ditempatkan di aplikasi.

Dashboard operasional apoteker dan admin tetap berbasis web karena lebih sesuai untuk pekerjaan profesional.

## 2. Tujuan Produk

### Tujuan utama

- Mendatangkan pengguna melalui konten edukasi, Kamus Obat, dan Swamedikasi Aman.
- Membangun kepercayaan melalui profil apoteker terverifikasi.
- Memungkinkan pengguna mencoba konsultasi pertama dengan hambatan minimal.
- Mengarahkan pengguna ke aplikasi untuk tindak lanjut, reminder, dan pengelolaan terapi.
- Menyediakan workspace web untuk apoteker dan admin.

### Bukan tujuan web

- Menjadi aplikasi pasien dengan fitur lengkap.
- Mengelola kepatuhan dan reminder obat jangka panjang.
- Menyediakan marketplace atau transaksi obat.
- Mengelola stok apotek secara real-time.
- Menggantikan diagnosis dokter atau validasi apoteker.

## 3. Positioning

> Temukan informasi obat yang mudah dipahami dan konsultasikan kebutuhan obat dengan apoteker terverifikasi. Lanjutkan pendampingan lengkap melalui aplikasi Medisigna.

Medisigna bukan sistem diagnosis otomatis. Informasi yang diberikan merupakan edukasi dan panduan awal, dengan apoteker sebagai pengaman klinis utama.

## 4. Pembagian Platform

### Web publik

Berfungsi untuk discovery, edukasi, trust, dan konversi:

- Landing page.
- Artikel edukasi obat dan penyakit.
- Kamus Obat mode masyarakat.
- Swamedikasi Aman versi ringan.
- Daftar dan profil publik apoteker terverifikasi.
- Preview layanan Medisigna.
- Katalog singkat Class Medisigna dan redirect.
- CTA download aplikasi melalui QR code atau deep link.

### Web pasien

Berfungsi untuk onboarding dan konsultasi awal:

- Register dan login.
- Profil kesehatan dasar.
- Memilih apoteker.
- Memulai konsultasi pertama.
- Mengirim pesan dan upload foto obat atau resep.
- Menyelesaikan konsultasi yang sedang berlangsung.
- Melihat ringkasan konsultasi.
- Melihat riwayat konsultasi secara read-only.
- Melanjutkan pengalaman melalui aplikasi.

### Web apoteker

Berfungsi sebagai workspace operasional:

- Registrasi dan pengajuan verifikasi.
- Status verifikasi.
- Daftar sesi konsultasi.
- Chat dengan pasien.
- Melihat Patient Snapshot.
- Melihat dokumen yang dikirim pasien.
- Membuat ringkasan konsultasi.
- Menandai kasus selesai atau dirujuk.
- Membuat rekomendasi jadwal obat untuk diterima pasien di aplikasi.

### Web admin

Berfungsi untuk pengawasan dan pengelolaan:

- Verifikasi apoteker.
- Manajemen pengguna dan status akun.
- Monitoring konsultasi.
- CMS artikel edukasi.
- Pengelolaan Kamus Obat.
- Pengelolaan pertanyaan dan rule Swamedikasi Aman.
- Audit log aktivitas penting.
- Laporan operasional dasar.

### Aplikasi pasien

Menjadi produk utama untuk retensi dan penggunaan berulang:

- Reminder dan push notification.
- Checklist kepatuhan minum obat.
- Refill reminder.
- Profil kesehatan lengkap.
- Pengelolaan obat rutin.
- Follow-up konsultasi.
- Riwayat terapi lengkap.
- Cari obat dan pelacakan respons apotek.
- Booking Homecare.
- Store dan riwayat pembelian.
- Integrasi akun Class.
- Fitur keluarga atau pendamping lansia pada fase lanjutan.

## 5. User Journey Utama

### Discovery dari pencarian

`Google/artikel -> Kamus Obat atau artikel -> CTA Tanya Apoteker -> pilih apoteker -> register/login -> konsultasi awal -> ringkasan -> lanjutkan di aplikasi`

### Swamedikasi Aman

`Pilih keluhan -> jawab pertanyaan -> cek red flag -> hasil Hijau/Kuning/Merah -> edukasi -> CTA Tanya Apoteker atau download aplikasi`

### Konsultasi awal

`Pilih apoteker -> isi topik singkat -> mulai sesi -> chat/upload -> apoteker memberi ringkasan -> sesi selesai -> CTA lanjutkan di aplikasi`

### Pengguna kembali

`Login web -> lihat konsultasi terakhir -> buka ringkasan atau lanjutkan sesi aktif -> CTA aplikasi untuk reminder dan follow-up`

### Apoteker

`Login -> lihat sesi -> buka Patient Snapshot -> chat/review dokumen -> buat ringkasan -> selesai/rujuk -> rekomendasikan tindak lanjut di aplikasi`

## 6. Fitur Web

### 6.1 Landing page

- Value proposition yang singkat dan jelas.
- Penjelasan bahwa layanan didampingi apoteker terverifikasi.
- Akses cepat ke Kamus Obat, Swamedikasi Aman, dan Tanya Apoteker.
- Preview fitur aplikasi: reminder, pencarian obat, dan homecare.
- CTA utama `Tanya Apoteker`.
- CTA sekunder `Download Aplikasi`.
- Link Class Medisigna.

### 6.2 Artikel edukasi

- Daftar dan detail artikel.
- Kategori dan pencarian sederhana.
- Metadata SEO.
- Nama reviewer dan tanggal review.
- CTA kontekstual ke Kamus Obat atau Tanya Apoteker.

Artikel ditulis melalui CMS admin. Sistem komentar, rating, dan personalisasi konten tidak diperlukan pada MVP.

### 6.3 Kamus Obat mode masyarakat

- Pencarian berdasarkan nama generik, merek, dan alias.
- Informasi dalam bahasa awam:
  - kegunaan;
  - cara pakai umum;
  - hubungan dengan makanan bila relevan;
  - efek samping umum;
  - peringatan;
  - kapan harus mencari bantuan profesional.
- Reviewer dan tanggal review terakhir.
- CTA `Tanya Apoteker`.

Mode nakes tidak termasuk MVP web.

### 6.4 Swamedikasi Aman versi ringan

Fase awal mencakup 3–5 keluhan dengan materi dan rule yang telah divalidasi apoteker.

- Pertanyaan bercabang.
- Pemeriksaan red flag.
- Pemeriksaan populasi khusus.
- Output:
  - Hijau: edukasi swamedikasi aman.
  - Kuning: konsultasikan dengan apoteker.
  - Merah: segera menuju dokter atau fasilitas kesehatan.
- CTA ke Tanya Apoteker.
- Penyimpanan audit hasil secara minimal.

Sistem tidak menampilkan diagnosis pasti dan tidak merekomendasikan obat keras.

### 6.5 Direktori apoteker

- Dapat dilihat tanpa login.
- Hanya menampilkan apoteker terverifikasi.
- Informasi minimal:
  - foto;
  - nama dan gelar;
  - topik bantuan;
  - pengalaman singkat;
  - lokasi praktik;
  - jam layanan;
  - status online/offline.
- Filter status ketersediaan.
- CTA `Mulai Konsultasi`.

### 6.6 Konsultasi pasien

- User wajib login sebelum sesi dibuat.
- Topik konsultasi singkat.
- Chat teks.
- Upload gambar obat atau resep.
- Status sesi.
- Indikator pesan belum dibaca.
- Ringkasan akhir:
  - masalah utama;
  - edukasi;
  - peringatan;
  - saran tindak lanjut;
  - status selesai atau dirujuk.
- Riwayat sesi secara read-only.

Konsultasi yang telah dimulai harus dapat diselesaikan di web. Web tidak boleh menghentikan percakapan medis di tengah sesi untuk memaksa instalasi aplikasi.

### 6.7 Profil pasien dasar

- Nama.
- Tanggal lahir atau usia.
- Jenis kelamin.
- Nomor telepon.
- Kabupaten/kota.
- Alergi utama.
- Penyakit utama.
- Obat rutin.

Data klinis yang lebih lengkap dikelola melalui aplikasi pada fase berikutnya.

### 6.8 Konversi ke aplikasi

- QR code dan tautan download aplikasi.
- Deep link ke konteks terkait jika aplikasi mendukungnya.
- CTA setelah ringkasan konsultasi.
- CTA pada preview fitur reminder, cari obat, dan homecare.
- Akun yang sama digunakan di web dan aplikasi.
- Data konsultasi web tersedia di aplikasi.

CTA tidak boleh mengganggu penyelesaian kebutuhan medis yang sedang aktif.

### 6.9 Class Medisigna

- Tombol pada navbar dan landing page.
- Preview singkat program.
- Redirect ke platform Class Medisigna.

SSO, progress, sertifikat, dan riwayat pembelian lintas platform tidak termasuk MVP.

## 7. Status Konsultasi

| Status | Makna |
| --- | --- |
| Aktif | Sesi sedang berlangsung. |
| Menunggu Pasien | Apoteker menunggu jawaban pasien. |
| Menunggu Apoteker | Pasien menunggu jawaban apoteker. |
| Selesai | Ringkasan akhir telah diberikan. |
| Dirujuk | Pasien disarankan mencari layanan medis lanjutan. |
| Dibatalkan | Sesi dibatalkan. |

## 8. Guardrail Klinis

- Sistem tidak memberikan diagnosis pasti.
- Swamedikasi hanya mencakup keluhan ringan dan materi yang telah disetujui apoteker.
- Setiap flow Swamedikasi wajib memiliki red flag dan kondisi rujukan.
- Anak, ibu hamil/menyusui, lansia, alergi obat, polifarmasi, dan komorbid berisiko minimal diarahkan ke apoteker.
- Obat resep atau obat keras tidak direkomendasikan otomatis.
- Artikel dan informasi obat wajib memiliki reviewer dan tanggal review.
- Ringkasan konsultasi tidak boleh dihilangkan atau dikunci sebagai mekanisme konversi.
- Dokumen kesehatan hanya dapat diakses oleh pasien terkait, apoteker yang menangani, dan admin berwenang.

## 9. Prioritas Implementasi

### P0 — core yang wajib stabil

- Authentication dan role pasien, apoteker, admin.
- Registrasi dan verifikasi apoteker.
- Profil pasien dasar.
- Direktori dan detail apoteker.
- Chat konsultasi, upload, unread count, dan ringkasan.
- Dashboard apoteker.
- Dashboard admin minimal.
- Landing page dan CTA aplikasi.

### P1 — acquisition hooks

- Profil apoteker publik tanpa login.
- Artikel edukasi dan CMS.
- Kamus Obat mode masyarakat.
- Swamedikasi Aman untuk 3–5 keluhan.
- QR code/deep link aplikasi.
- Preview dan redirect Class Medisigna.

### P2 — setelah data penggunaan tersedia

- Perluasan Kamus Obat.
- Perluasan kategori Swamedikasi.
- SEO dan internal linking lanjutan.
- Analitik funnel konversi.
- Rekomendasi konten sederhana berdasarkan halaman yang dibuka.

## 10. Di Luar Scope Web MVP

- Reminder obat dan push notification.
- Checklist kepatuhan dan laporan adherence.
- Medication tracker lengkap.
- Refill reminder.
- Cari stok obat dan dashboard apotek rekanan.
- Booking dan operasional Homecare.
- Store, checkout, payment, dan pengiriman.
- Kamus Obat mode nakes.
- SSO dan sinkronisasi progress Class.
- Video call internal.
- Diagnosis otomatis.
- Stok apotek real-time.
- Subscription.
- Dashboard analitik kompleks.

Fitur tersebut dibangun ketika aplikasi atau modul bisnis terkait siap, bukan sebagai placeholder kompleks di web.

## 11. Data Utama Web

### Core

- User.
- Session dan account.
- Patient profile.
- Pharmacist profile dan status verifikasi.

### Konsultasi

- Consultation session.
- Consultation message.
- Consultation attachment.
- Consultation summary.
- Unread count.

### Konten

- Article.
- Article category.
- Drug information.
- Drug alias.
- Drug warning.
- Reviewer dan review date.

### Swamedikasi

- Symptom.
- Question dan option.
- Red flag.
- Rule.
- Result content.
- Audit log.

Entitas konten dan Swamedikasi ditambahkan hanya saat fiturnya mulai dikerjakan.

## 12. Acceptance Criteria

### Landing dan konversi

- Pengunjung memahami manfaat utama Medisigna dan dapat menemukan CTA konsultasi atau aplikasi.
- QR code/tautan aplikasi dapat digunakan.
- Preview fitur aplikasi tidak membuat pengguna mengira fitur tersebut tersedia penuh di web.

### Direktori apoteker

- Pengunjung dapat melihat apoteker terverifikasi tanpa login.
- Pengunjung dapat melihat profil, topik, jam layanan, dan status ketersediaan.
- Login hanya diminta saat pengguna memulai konsultasi.

### Konsultasi

- Pasien dapat membuat dan menyelesaikan sesi.
- Pasien dan apoteker dapat bertukar pesan dan gambar.
- Akses sesi dibatasi kepada pihak yang berwenang.
- Apoteker dapat membuat ringkasan dan menutup atau merujuk sesi.
- Pasien tetap dapat membaca ringkasan di web.
- Data sesi tersedia untuk integrasi aplikasi.

### Kamus Obat

- Pengunjung dapat mencari dan membuka informasi obat tanpa login.
- Informasi menampilkan reviewer dan tanggal review.
- Halaman menyediakan CTA konsultasi.

### Swamedikasi

- Pengunjung dapat menyelesaikan pertanyaan untuk keluhan yang tersedia.
- Sistem selalu menghasilkan status Hijau, Kuning, atau Merah.
- Red flag menghasilkan arahan ke fasilitas kesehatan.
- Output tidak menggunakan klaim diagnosis pasti.

### Dashboard profesional

- Apoteker hanya dapat menangani sesi yang menjadi tanggung jawabnya.
- Admin dapat memverifikasi apoteker.
- Aktivitas klinis penting dapat diaudit.

## 13. Metrik Keberhasilan

### Akuisisi

- Organic visits ke artikel dan Kamus Obat.
- Jumlah pengguna yang membuka profil apoteker.
- Rasio pengunjung yang memulai konsultasi.

### Aktivasi

- Persentase registrasi yang berhasil memulai konsultasi.
- Persentase sesi yang mendapat respons apoteker.
- Persentase sesi yang selesai dengan ringkasan.

### Konversi aplikasi

- Klik CTA download aplikasi.
- Scan QR code.
- Instalasi yang teratribusi dari web bila tracking tersedia.
- Pengguna web yang login di aplikasi.

### Kualitas layanan

- Waktu respons awal apoteker.
- Jumlah sesi dirujuk.
- Jumlah laporan keamanan atau akses tidak sah.

Metrik reminder, kepatuhan, refill, dan repeat therapy menjadi metrik aplikasi, bukan web.

## 14. Urutan Pengerjaan

1. Stabilkan autentikasi, role, profil, konsultasi, dan verifikasi apoteker.
2. Jadikan daftar dan profil apoteker dapat ditemukan publik.
3. Tambahkan CTA dan handoff ke aplikasi.
4. Bangun artikel edukasi dan CMS sederhana.
5. Bangun Kamus Obat mode masyarakat.
6. Bangun Swamedikasi Aman untuk 3–5 keluhan tervalidasi.
7. Tambahkan analitik funnel setelah traffic dan aplikasi tersedia.

## 15. Keputusan Produk

- Web adalah acquisition funnel dan pintu konsultasi awal.
- Aplikasi adalah produk utama pasien untuk penggunaan berulang.
- Dashboard apoteker dan admin tetap di web.
- Konsultasi aktif dan informasi keselamatan tidak dikunci untuk memaksa instalasi.
- Fitur operasional baru hanya dibangun setelah modul bisnisnya siap.
- Satu akun dan data konsultasi harus dapat digunakan lintas web dan aplikasi.
