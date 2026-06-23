# PRD MVP Medisigna: Mobile-First Konseling Apoteker + Reminder

## Summary
- Bangun **web responsive/PWA dengan prioritas UX mobile**.
- Core MVP: **pilih apoteker -> chat realtime -> ringkasan konseling -> reminder obat**.
- Konseling gratis untuk MVP.
- Reminder bisa dibuat oleh user sendiri atau dari hasil chat apoteker.
- Class Medisigna cukup redirect ke web Class yang sudah ada.

## Key Flow
- User daftar/login dan melengkapi profil kesehatan dasar.
- User melihat list apoteker tersedia:
  - foto
  - nama
  - badge terverifikasi
  - status online/sibuk/offline
  - topik bantuan
  - tombol chat
- User klik apoteker dan langsung masuk chat.
- Sistem hanya menampilkan welcome ringan.
- Apoteker bertanya sesuai kebutuhan, dengan bantuan Patient Snapshot dari profil user.
- Apoteker menutup sesi dengan ringkasan konseling.
- Dari ringkasan, apoteker bisa membuat reminder obat.
- User juga bisa membuat reminder obat sendiri dari menu Reminder.

## Reminder Flow
- Jalur apoteker:
  `Chat selesai -> apoteker buat ringkasan -> buat reminder -> user aktifkan/checklist`
- Jalur user:
  `Reminder -> tambah obat -> isi jadwal -> aktifkan reminder`
- Reminder harian:
  `Push PWA muncul -> user pilih Sudah Minum / Lewati / Tunda`
- Data reminder minimal:
  - nama obat
  - dosis
  - frekuensi
  - waktu minum
  - sebelum/sesudah makan
  - tanggal mulai
  - durasi/tanggal selesai
  - catatan
- Status reminder:
  - aktif
  - selesai
  - dihentikan
- Reminder dari apoteker diberi badge `Dibuat oleh Apoteker`.

## Mobile-First UX
- Navigasi bawah mobile:
  - Beranda
  - Apoteker
  - Reminder
  - Riwayat
  - Profil
- Beranda fokus pada aksi cepat:
  - chat apoteker
  - jadwal obat hari ini
  - lanjutkan chat aktif
  - akses Class
- UI chat dibuat seperti aplikasi chat mobile:
  - bubble pesan
  - upload foto obat/resep
  - status sesi
  - ringkasan konseling sebagai kartu khusus
- Reminder dibuat seperti daily medication checklist:
  - jadwal hari ini di paling atas
  - tombol besar `Sudah Minum`, `Tunda`, `Lewati`
  - daftar obat aktif di bawahnya

## Acceptance Criteria
- Tampilan mobile nyaman dipakai sebagai pengalaman utama.
- User bisa melihat dan memilih apoteker.
- User bisa chat realtime dan upload foto.
- Apoteker bisa melihat Patient Snapshot.
- Apoteker bisa membuat ringkasan konseling.
- Reminder bisa dibuat dari chat atau manual.
- Push PWA reminder berjalan pada browser/perangkat yang mendukung.
- User bisa checklist kepatuhan obat harian.
- Class Medisigna bisa diakses lewat redirect.

## Assumptions
- MVP mobile-first, desktop tetap usable tapi bukan prioritas utama.
- Konseling gratis selama MVP.
- Profil kesehatan membantu apoteker, tapi tidak menghalangi user mulai chat.
- Metrik utama: repeat chat, reminder aktif, dan checklist kepatuhan.
