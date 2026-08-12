import "dotenv/config"

import { randomUUID } from "node:crypto"
import { hashPassword } from "better-auth/crypto"

import { db } from "../lib/db"

const pharmacistPassword = "Apoteker123!"
const patientPassword = "Pasien123!"
const adminPassword = "Admin123!"

const admin = {
  name: "Admin Medisigna",
  email: "admin@medisigna.local",
} as const

const pharmacists = [
  {
    name: "Apt. Rania Putri",
    email: "rania.apoteker@medisigna.local",
    phone: "081200000001",
    title: "S.Farm., Apt.",
    strNumber: "STRA-VER-0001",
    topics: ["Obat harian", "Efek samping", "Interaksi obat"],
    practiceLocation: "Apotek Medika Utama, Denpasar",
    serviceHours: "08.00 - 16.00 WITA",
    availabilityStatus: "ONLINE",
  },
  {
    name: "Apt. Dimas Wicaksono",
    email: "dimas.apoteker@medisigna.local",
    phone: "081200000002",
    title: "S.Farm., Apt.",
    strNumber: "STRA-VER-0002",
    topics: ["Diabetes", "Hipertensi", "Obat rutin"],
    practiceLocation: "Klinik Sehat Bersama, Makassar",
    serviceHours: "09.00 - 17.00 WITA",
    availabilityStatus: "ONLINE",
  },
  {
    name: "Apt. Nabila Sari",
    email: "nabila.apoteker@medisigna.local",
    phone: "081200000003",
    title: "M.Farm., Apt.",
    strNumber: "STRA-VER-0003",
    topics: ["Ibu dan anak", "Vitamin", "Obat bebas"],
    practiceLocation: "Apotek Keluarga, Balikpapan",
    serviceHours: "10.00 - 18.00 WITA",
    availabilityStatus: "ONLINE",
  },
  {
    name: "Apt. Farhan Hakim",
    email: "farhan.apoteker@medisigna.local",
    phone: "081200000004",
    title: "S.Farm., Apt.",
    strNumber: "STRA-VER-0004",
    topics: ["Antibiotik", "Alergi", "Obat resep"],
    practiceLocation: "RS Mitra Husada, Samarinda",
    serviceHours: "13.00 - 20.00 WITA",
    availabilityStatus: "OFFLINE",
  },
  {
    name: "Apt. Citra Lestari",
    email: "citra.apoteker@medisigna.local",
    phone: "081200000005",
    title: "S.Farm., Apt.",
    strNumber: "STRA-VER-0005",
    topics: ["Nyeri", "Demam", "Swamedikasi"],
    practiceLocation: "Apotek Prima Farma, Manado",
    serviceHours: "07.00 - 15.00 WITA",
    availabilityStatus: "OFFLINE",
  },
] as const

const demoPatients = [
  {
    name: "Maya Lestari",
    email: "maya.pasien@medisigna.local",
    phone: "081300000001",
  },
  {
    name: "Raka Pratama",
    email: "raka.pasien@medisigna.local",
    phone: "081300000002",
  },
] as const

const demoDrugs = [
  {
    slug: "parasetamol",
    genericName: "Parasetamol",
    brandNames: ["Panadol", "Sanmol"],
    aliases: ["Paracetamol", "Acetaminophen"],
    uses: "Contoh informasi untuk membantu mengenali obat yang umum digunakan untuk demam dan nyeri ringan.",
    generalUsage: "Gunakan hanya sesuai petunjuk pada kemasan atau arahan tenaga kesehatan. Periksa kandungan obat lain agar tidak memakai beberapa produk yang sama-sama mengandung parasetamol.",
    foodGuidance: "Umumnya dapat digunakan dengan atau tanpa makanan.",
    commonSideEffects: ["Mual ringan", "Reaksi kulit pada sebagian orang"],
    warnings: ["Jangan melebihi petunjuk pada kemasan", "Berhati-hati jika memiliki gangguan hati atau sering mengonsumsi alkohol"],
    seekHelpWhen: ["Terjadi sesak, bengkak, atau ruam berat", "Demam atau nyeri tidak membaik", "Diduga menggunakan lebih dari jumlah yang dianjurkan"],
  },
  {
    slug: "ibuprofen",
    genericName: "Ibuprofen",
    brandNames: ["Proris", "Advil"],
    aliases: ["Ibuprofenum"],
    uses: "Contoh informasi untuk obat pereda nyeri dan peradangan yang umum digunakan pada kondisi tertentu.",
    generalUsage: "Ikuti petunjuk kemasan atau tenaga kesehatan dan gunakan dalam waktu sesingkat yang diperlukan.",
    foodGuidance: "Biasanya digunakan setelah makan untuk membantu mengurangi rasa tidak nyaman pada lambung.",
    commonSideEffects: ["Mual", "Nyeri ulu hati", "Pusing"],
    warnings: ["Tidak cocok untuk sebagian orang dengan riwayat tukak lambung, gangguan ginjal, atau alergi obat antiinflamasi", "Konsultasikan penggunaan saat hamil"],
    seekHelpWhen: ["Muntah darah atau tinja berwarna hitam", "Sesak atau bengkak", "Nyeri menetap atau memburuk"],
  },
  {
    slug: "cetirizine",
    genericName: "Cetirizine",
    brandNames: ["Incidal-OD", "Zyrtec"],
    aliases: ["Cetirizine hydrochloride", "Setirizin"],
    uses: "Contoh informasi untuk obat yang umum digunakan membantu meredakan gejala alergi.",
    generalUsage: "Ikuti petunjuk kemasan atau arahan tenaga kesehatan. Perhatikan respons tubuh sebelum mengemudi atau mengoperasikan alat.",
    foodGuidance: "Umumnya dapat digunakan dengan atau tanpa makanan.",
    commonSideEffects: ["Mengantuk", "Mulut kering", "Pusing"],
    warnings: ["Dapat menyebabkan kantuk pada sebagian orang", "Konsultasikan jika memiliki gangguan ginjal atau sedang menggunakan obat lain yang menyebabkan kantuk"],
    seekHelpWhen: ["Sesak atau bengkak pada wajah", "Gejala alergi semakin berat", "Kantuk sangat mengganggu"],
  },
  {
    slug: "loratadine",
    genericName: "Loratadine",
    brandNames: ["Clarityne", "Alloris"],
    aliases: ["Loratadin"],
    uses: "Contoh informasi untuk obat yang umum digunakan membantu meredakan bersin, hidung berair, atau gatal akibat alergi.",
    generalUsage: "Gunakan sesuai petunjuk kemasan atau arahan tenaga kesehatan.",
    foodGuidance: "Umumnya dapat digunakan dengan atau tanpa makanan.",
    commonSideEffects: ["Sakit kepala", "Mulut kering", "Mengantuk pada sebagian orang"],
    warnings: ["Konsultasikan jika memiliki gangguan hati", "Jangan menggandakan penggunaan dengan obat alergi lain tanpa arahan tenaga kesehatan"],
    seekHelpWhen: ["Sesak atau bengkak pada wajah", "Gejala tidak membaik atau semakin berat"],
  },
  {
    slug: "antasida",
    genericName: "Antasida",
    brandNames: ["Promag", "Mylanta"],
    aliases: ["Antacid", "Obat maag"],
    uses: "Contoh informasi untuk obat yang membantu menetralkan asam lambung dan meredakan keluhan maag ringan sementara.",
    generalUsage: "Ikuti petunjuk produk. Beri jarak dengan obat lain karena antasida dapat memengaruhi penyerapannya.",
    foodGuidance: "Waktu penggunaan bergantung pada produk; ikuti petunjuk pada kemasan.",
    commonSideEffects: ["Sembelit", "Diare", "Mual"],
    warnings: ["Komposisi tiap merek dapat berbeda", "Konsultasikan jika memiliki gangguan ginjal atau menggunakan obat rutin"],
    seekHelpWhen: ["Nyeri dada", "Muntah darah atau tinja hitam", "Keluhan sering berulang atau tidak membaik"],
  },
  {
    slug: "oralit",
    genericName: "Oralit",
    brandNames: ["Oralit Kimia Farma", "Pharolit"],
    aliases: ["ORS", "Oral rehydration salts", "Garam rehidrasi oral"],
    uses: "Contoh informasi untuk larutan pengganti cairan dan elektrolit yang hilang akibat diare atau muntah.",
    generalUsage: "Larutkan tepat sesuai volume air pada petunjuk kemasan. Jangan menambahkan gula atau bahan lain.",
    foodGuidance: "Dapat diberikan sedikit demi sedikit; makanan tetap dilanjutkan sesuai toleransi dan arahan tenaga kesehatan.",
    commonSideEffects: ["Mual jika diminum terlalu cepat", "Perut terasa penuh"],
    warnings: ["Takaran air yang tidak tepat dapat berbahaya", "Gunakan air bersih dan buang larutan sesuai batas waktu pada kemasan"],
    seekHelpWhen: ["Tidak dapat minum", "Tanda dehidrasi berat, lemas, atau penurunan kesadaran", "Diare berdarah atau berlanjut"],
  },
  {
    slug: "povidone-iodine",
    genericName: "Povidone iodine",
    brandNames: ["Betadine"],
    aliases: ["Povidon iodin", "PVP-I"],
    uses: "Contoh informasi untuk antiseptik kulit pada luka ringan tertentu.",
    generalUsage: "Gunakan pada kulit sesuai petunjuk produk. Hindari penggunaan luas atau berkepanjangan tanpa arahan tenaga kesehatan.",
    foodGuidance: null,
    commonSideEffects: ["Iritasi kulit", "Rasa perih sementara"],
    warnings: ["Hanya untuk pemakaian luar", "Hindari mata dan jangan ditelan", "Konsultasikan jika memiliki gangguan tiroid atau alergi terhadap produk"],
    seekHelpWhen: ["Luka dalam, luas, atau akibat gigitan", "Muncul bengkak, nanah, demam, atau iritasi berat"],
  },
  {
    slug: "clotrimazole-topikal",
    genericName: "Clotrimazole topikal",
    brandNames: ["Canesten"],
    aliases: ["Klotrimazol", "Clotrimazole cream"],
    uses: "Contoh informasi untuk obat antijamur yang digunakan pada beberapa infeksi jamur di kulit.",
    generalUsage: "Gunakan hanya pada area kulit sesuai petunjuk produk atau tenaga kesehatan. Jaga area tetap bersih dan kering.",
    foodGuidance: null,
    commonSideEffects: ["Rasa terbakar ringan", "Gatal", "Iritasi kulit"],
    warnings: ["Hanya untuk pemakaian luar", "Hindari mata dan area yang tidak disebutkan pada petunjuk produk"],
    seekHelpWhen: ["Iritasi berat atau bengkak", "Keluhan menyebar, berulang, atau tidak membaik"],
  },
  {
    slug: "dextromethorphan",
    genericName: "Dextromethorphan",
    brandNames: ["Siladex DMP", "Vicks Formula 44"],
    aliases: ["Dekstrometorfan", "Dextromethorphan HBr"],
    uses: "Contoh informasi untuk obat yang digunakan pada sebagian jenis batuk kering.",
    generalUsage: "Periksa komposisi produk karena sering tersedia dalam obat kombinasi. Gunakan sesuai petunjuk kemasan.",
    foodGuidance: "Umumnya dapat digunakan dengan atau tanpa makanan.",
    commonSideEffects: ["Mengantuk", "Pusing", "Mual"],
    warnings: ["Tidak sesuai untuk semua jenis batuk", "Dapat berinteraksi dengan obat tertentu, termasuk sebagian antidepresan", "Hindari penyalahgunaan"],
    seekHelpWhen: ["Sesak, batuk darah, atau demam tinggi", "Batuk menetap atau memburuk", "Terjadi kebingungan atau reaksi berat"],
  },
  {
    slug: "guaifenesin",
    genericName: "Guaifenesin",
    brandNames: ["Woods Expectorant"],
    aliases: ["Gliseril guaiakolat", "GG", "Glyceryl guaiacolate"],
    uses: "Contoh informasi untuk ekspektoran yang membantu mengencerkan dahak pada kondisi tertentu.",
    generalUsage: "Periksa komposisi produk karena dapat tersedia dalam obat kombinasi. Gunakan sesuai petunjuk kemasan.",
    foodGuidance: "Minum cairan yang cukup jika tidak ada pembatasan cairan dari tenaga kesehatan.",
    commonSideEffects: ["Mual", "Pusing", "Tidak nyaman pada lambung"],
    warnings: ["Tidak menggantikan pemeriksaan penyebab batuk", "Konsultasikan penggunaan pada anak, kehamilan, atau jika menggunakan obat lain"],
    seekHelpWhen: ["Sesak, nyeri dada, atau batuk darah", "Batuk menetap, disertai demam tinggi, atau semakin berat"],
  },
] as const

const demoArticles = [
  {
    slug: "cara-aman-membaca-label-obat",
    title: "Cara Aman Membaca Label Obat",
    category: "Edukasi Obat",
    excerpt: "Panduan singkat memahami nama obat, aturan pakai, komposisi, dan peringatan pada kemasan.",
    contentMarkdown: `## Kenali informasi utama

Baca nama obat, kandungan aktif, kekuatan sediaan, aturan pakai, dan batas penggunaan sebelum meminum obat.

## Perhatikan peringatan

Cari informasi alergi, batas usia, kehamilan, menyusui, penyakit tertentu, dan obat lain yang sedang digunakan.

## Kapan perlu bertanya

Tanya apoteker jika aturan pakai tidak jelas, ada lebih dari satu obat dengan kandungan serupa, atau keluhan tidak membaik.`,
    metaTitle: "Cara Aman Membaca Label Obat | Medisigna",
    metaDescription: "Pelajari cara membaca label obat agar penggunaan obat harian lebih aman.",
    coverImageUrl: "/landing-carousel/apoteker1.png",
    publishedAt: new Date("2026-07-01T00:00:00.000Z"),
  },
  {
    slug: "kenali-efek-samping-yang-perlu-diwaspadai",
    title: "Kenali Efek Samping yang Perlu Diwaspadai",
    category: "Keamanan Obat",
    excerpt: "Tidak semua efek samping berbahaya, tetapi beberapa tanda perlu segera dikonsultasikan.",
    contentMarkdown: `## Efek samping ringan

Sebagian obat dapat menimbulkan mual, pusing, kantuk, atau tidak nyaman pada lambung.

## Tanda bahaya

Segera cari bantuan bila muncul sesak, bengkak wajah, ruam luas, pingsan, muntah darah, atau keluhan berat lain.

## Catat riwayat obat

Simpan daftar obat dan reaksi yang pernah dialami agar apoteker dan dokter dapat membantu menilai risikonya.`,
    metaTitle: "Efek Samping Obat yang Perlu Diwaspadai | Medisigna",
    metaDescription: "Kenali tanda efek samping obat yang membutuhkan bantuan tenaga kesehatan.",
    coverImageUrl: "/landing-carousel/apoteker2.png",
    publishedAt: new Date("2026-07-03T00:00:00.000Z"),
  },
  {
    slug: "antibiotik-harus-digunakan-dengan-tepat",
    title: "Antibiotik Harus Digunakan dengan Tepat",
    category: "Antibiotik",
    excerpt: "Antibiotik tidak selalu diperlukan dan harus digunakan sesuai arahan tenaga kesehatan.",
    contentMarkdown: `## Bukan untuk semua keluhan

Antibiotik digunakan untuk infeksi bakteri tertentu, bukan untuk semua demam, flu, batuk, atau sakit tenggorokan.

## Ikuti arahan

Gunakan sesuai resep. Jangan berbagi antibiotik, menyimpan sisa obat untuk keluhan berikutnya, atau menghentikan terapi tanpa arahan.

## Konsultasikan

Tanya apoteker bila lupa minum obat, muncul efek samping, atau sedang menggunakan obat lain.`,
    metaTitle: "Penggunaan Antibiotik yang Tepat | Medisigna",
    metaDescription: "Edukasi penggunaan antibiotik agar lebih aman dan bertanggung jawab.",
    coverImageUrl: "/landing-carousel/apoteker3.png",
    publishedAt: new Date("2026-07-05T00:00:00.000Z"),
  },
  {
    slug: "tips-menyimpan-obat-di-rumah",
    title: "Tips Menyimpan Obat di Rumah",
    category: "Obat Rumahan",
    excerpt: "Cara menyimpan obat agar kualitasnya terjaga dan tidak mudah tertukar.",
    contentMarkdown: `## Simpan sesuai petunjuk

Ikuti instruksi suhu, cahaya, dan kelembapan pada kemasan. Jangan memindahkan obat tanpa label yang jelas.

## Pisahkan obat

Pisahkan obat anak, obat dewasa, obat luar, dan obat yang sudah kedaluwarsa.

## Cek berkala

Periksa tanggal kedaluwarsa dan kondisi obat secara rutin. Buang obat rusak sesuai arahan fasilitas kesehatan setempat.`,
    metaTitle: "Tips Menyimpan Obat di Rumah | Medisigna",
    metaDescription: "Panduan ringkas menyimpan obat rumahan dengan aman.",
    coverImageUrl: "/landing-carousel/apoteker1.png",
    publishedAt: new Date("2026-07-07T00:00:00.000Z"),
  },
  {
    slug: "kapan-harus-bertanya-ke-apoteker",
    title: "Kapan Harus Bertanya ke Apoteker",
    category: "Konsultasi",
    excerpt: "Situasi umum ketika bantuan apoteker dapat membantu penggunaan obat lebih aman.",
    contentMarkdown: `## Saat mulai obat baru

Tanyakan cara pakai, waktu minum, efek samping yang umum, dan hal yang perlu dihindari.

## Saat memakai banyak obat

Apoteker dapat membantu mengecek duplikasi kandungan, interaksi, dan jadwal minum yang lebih mudah diikuti.

## Saat ragu

Konsultasikan bila label sulit dipahami, keluhan tidak membaik, atau ada kondisi khusus seperti hamil, menyusui, lansia, atau penyakit kronis.`,
    metaTitle: "Kapan Harus Bertanya ke Apoteker | Medisigna",
    metaDescription: "Kenali waktu yang tepat untuk berkonsultasi dengan apoteker.",
    coverImageUrl: "/landing-carousel/apoteker2.png",
    publishedAt: new Date("2026-07-09T00:00:00.000Z"),
  },
] as const

const demoEducationalVideos = [
  {
    slug: "video-membaca-aturan-pakai-obat",
    title: "Membaca Aturan Pakai Obat",
    category: "Edukasi Obat",
    excerpt: "Video singkat tentang bagian penting pada aturan pakai obat dan kapan perlu bertanya.",
    youtubeVideoId: "dFhhLtAkP0E",
    publishedAt: new Date("2026-07-02T00:00:00.000Z"),
  },
  {
    slug: "video-mencegah-duplikasi-kandungan-obat",
    title: "Mencegah Duplikasi Kandungan Obat",
    category: "Keamanan Obat",
    excerpt: "Kenali risiko memakai beberapa produk dengan kandungan aktif yang sama.",
    youtubeVideoId: "dFhhLtAkP0E",
    publishedAt: new Date("2026-07-04T00:00:00.000Z"),
  },
  {
    slug: "video-antibiotik-bukan-obat-semua-penyakit",
    title: "Antibiotik Bukan Obat Semua Penyakit",
    category: "Antibiotik",
    excerpt: "Edukasi ringkas tentang penggunaan antibiotik yang perlu mengikuti arahan tenaga kesehatan.",
    youtubeVideoId: "dFhhLtAkP0E",
    publishedAt: new Date("2026-07-06T00:00:00.000Z"),
  },
  {
    slug: "video-menyimpan-obat-di-rumah",
    title: "Menyimpan Obat di Rumah",
    category: "Obat Rumahan",
    excerpt: "Langkah sederhana menyimpan obat agar tetap aman dan mudah dikenali.",
    youtubeVideoId: "dFhhLtAkP0E",
    publishedAt: new Date("2026-07-08T00:00:00.000Z"),
  },
  {
    slug: "video-persiapan-konsultasi-apoteker",
    title: "Persiapan Konsultasi Apoteker",
    category: "Konsultasi",
    excerpt: "Apa saja yang sebaiknya disiapkan sebelum bertanya tentang obat kepada apoteker.",
    youtubeVideoId: "dFhhLtAkP0E",
    publishedAt: new Date("2026-07-10T00:00:00.000Z"),
  },
] as const

const demoForumCategories = [
  {
    name: "Obat Harian",
    slug: "obat-harian",
    description: "Diskusi tentang penggunaan obat rutin dan obat yang sering dipakai di rumah.",
  },
  {
    name: "Efek Samping",
    slug: "efek-samping",
    description: "Ruang bertanya tentang keluhan setelah menggunakan obat.",
  },
  {
    name: "Ibu dan Anak",
    slug: "ibu-dan-anak",
    description: "Diskusi seputar obat, vitamin, dan keamanan penggunaan pada keluarga.",
  },
  {
    name: "Antibiotik",
    slug: "antibiotik",
    description: "Diskusi penggunaan antibiotik yang tepat dan bertanggung jawab.",
  },
] as const

const demoForumThreads = [
  {
    slug: "minum-obat-maag-boleh-bareng-obat-lain",
    title: "Minum obat maag boleh bareng obat lain?",
    categorySlug: "obat-harian",
    authorEmail: demoPatients[0].email,
    createdAt: new Date("2026-08-08T01:10:00.000Z"),
    bodyMarkdown:
      "Aku lagi minum obat maag cair sebelum makan, tapi juga ada obat alergi dari klinik. Biasanya aku minum semuanya dekat-dekatan karena takut lupa.\n\nSebenarnya perlu dikasih jarak berapa lama ya?",
    replies: [
      {
        key: "pharmacist-answer",
        authorEmail: pharmacists[0].email,
        createdAt: new Date("2026-08-08T01:24:00.000Z"),
        bodyMarkdown:
          "Sebaiknya diberi jarak sekitar 1-2 jam dari obat lain, terutama kalau obat maag yang diminum termasuk antasida.\n\nAntasida bisa memengaruhi penyerapan beberapa obat. Kalau obat alerginya diminum malam, obat maag bisa tetap mengikuti jadwal sebelum makan.",
      },
      {
        authorEmail: demoPatients[0].email,
        parentKey: "pharmacist-answer",
        createdAt: new Date("2026-08-08T01:38:00.000Z"),
        bodyMarkdown:
          "Berarti kalau obat maag jam 7 pagi, obat alerginya aman sekitar jam 9 ya? Obat alerginya cetirizine.",
      },
      {
        authorEmail: pharmacists[1].email,
        parentKey: "pharmacist-answer",
        createdAt: new Date("2026-08-08T02:02:00.000Z"),
        bodyMarkdown:
          "Untuk cetirizine umumnya bisa diminum malam karena bisa bikin mengantuk pada sebagian orang. Kalau ada aturan khusus dari dokter, ikuti yang dari dokter dulu.",
      },
    ],
  },
  {
    slug: "anak-demam-parasetamol-turun-lalu-naik-lagi",
    title: "Anak demam, parasetamol turun lalu naik lagi",
    categorySlug: "ibu-dan-anak",
    authorEmail: demoPatients[1].email,
    createdAt: new Date("2026-08-08T04:15:00.000Z"),
    bodyMarkdown:
      "Anak umur 5 tahun demam sejak tadi malam. Setelah parasetamol turun, tapi 5 jam kemudian naik lagi.\n\nMasih boleh lanjut sesuai dosis kemasan atau harus langsung dibawa periksa?",
    replies: [
      {
        key: "dose-check",
        authorEmail: pharmacists[2].email,
        createdAt: new Date("2026-08-08T04:33:00.000Z"),
        bodyMarkdown:
          "Parasetamol biasanya boleh diulang sesuai interval pada kemasan, tapi dosis perlu disesuaikan dengan berat badan anak.\n\nSegera periksa kalau anak tampak lemas berat, sulit minum, sesak, kejang, muncul ruam luas, atau demam menetap lebih dari 3 hari.",
      },
      {
        authorEmail: demoPatients[1].email,
        parentKey: "dose-check",
        createdAt: new Date("2026-08-08T04:46:00.000Z"),
        bodyMarkdown:
          "Beratnya sekitar 18 kg. Anak masih mau minum dan makan sedikit, cuma rewel.",
      },
      {
        authorEmail: pharmacists[2].email,
        parentKey: "dose-check",
        createdAt: new Date("2026-08-08T05:05:00.000Z"),
        bodyMarkdown:
          "Kalau masih mau minum, pantau cairan dan suhu. Pastikan takaran parasetamol mengikuti kekuatan sediaan yang dipakai. Kalau ragu dengan ml per dosis, sebaiknya cek label atau tanya apoteker dengan foto kemasannya.",
      },
    ],
  },
  {
    slug: "antibiotik-sisa-boleh-diminum-lagi",
    title: "Antibiotik sisa boleh diminum lagi?",
    categorySlug: "antibiotik",
    authorEmail: demoPatients[0].email,
    createdAt: new Date("2026-08-09T02:05:00.000Z"),
    bodyMarkdown:
      "Bulan lalu aku dapat antibiotik untuk radang tenggorokan, masih ada sisa 4 tablet. Sekarang tenggorokan sakit lagi dan agak demam.\n\nBoleh diminum lagi tidak?",
    replies: [
      {
        key: "dont-use-leftover",
        authorEmail: pharmacists[3].email,
        createdAt: new Date("2026-08-09T02:22:00.000Z"),
        bodyMarkdown:
          "Jangan gunakan antibiotik sisa tanpa pemeriksaan. Sakit tenggorokan tidak selalu karena bakteri, dan antibiotik yang tidak tepat bisa meningkatkan risiko resistensi atau efek samping.",
      },
      {
        authorEmail: pharmacists[0].email,
        parentKey: "dont-use-leftover",
        createdAt: new Date("2026-08-09T02:45:00.000Z"),
        bodyMarkdown:
          "Tambahan: sisa 4 tablet juga biasanya tidak cukup untuk satu terapi lengkap. Lebih aman periksa dulu, terutama kalau demam tinggi, sulit menelan, atau keluhan makin berat.",
      },
    ],
  },
  {
    slug: "minum-obat-alergi-bikin-ngantuk",
    title: "Minum obat alergi bikin ngantuk, normal?",
    categorySlug: "efek-samping",
    authorEmail: demoPatients[1].email,
    createdAt: new Date("2026-08-10T08:30:00.000Z"),
    bodyMarkdown:
      "Aku minum cetirizine karena gatal-gatal, tapi setelah itu ngantuk banget sampai susah kerja. Ini normal atau harus ganti obat?",
    replies: [
      {
        key: "sleepy-answer",
        authorEmail: pharmacists[1].email,
        createdAt: new Date("2026-08-10T08:49:00.000Z"),
        bodyMarkdown:
          "Mengantuk bisa terjadi pada sebagian orang setelah cetirizine. Kalau mengganggu aktivitas, coba diskusikan alternatif dengan apoteker atau dokter, misalnya pilihan antihistamin yang lebih tidak mengantuk untuk sebagian orang.",
      },
      {
        authorEmail: demoPatients[1].email,
        parentKey: "sleepy-answer",
        createdAt: new Date("2026-08-10T09:12:00.000Z"),
        bodyMarkdown:
          "Kalau diminum malam saja boleh? Gatalnya biasanya muncul sore sampai malam.",
      },
      {
        authorEmail: pharmacists[4].email,
        parentKey: "sleepy-answer",
        createdAt: new Date("2026-08-10T09:26:00.000Z"),
        bodyMarkdown:
          "Boleh dipertimbangkan diminum malam jika sesuai aturan pakai produk dan tidak ada arahan berbeda dari dokter. Hindari menyetir atau aktivitas butuh fokus kalau masih terasa mengantuk.",
      },
    ],
  },
  {
    slug: "oralit-untuk-diare-dewasa",
    title: "Oralit untuk diare dewasa diminum seberapa sering?",
    categorySlug: "obat-harian",
    authorEmail: demoPatients[0].email,
    createdAt: new Date("2026-08-11T03:20:00.000Z"),
    bodyMarkdown:
      "Diare dari pagi sudah 4 kali. Di rumah ada oralit sachet. Untuk dewasa minumnya seberapa sering ya, dan boleh tetap makan biasa?",
    replies: [
      {
        key: "ors-answer",
        authorEmail: pharmacists[4].email,
        createdAt: new Date("2026-08-11T03:41:00.000Z"),
        bodyMarkdown:
          "Oralit diminum sedikit-sedikit tapi sering, terutama setiap setelah BAB cair. Larutkan sesuai volume air pada kemasan, jangan dibuat lebih pekat atau ditambah gula.\n\nMakan tetap boleh sesuai toleransi, pilih makanan yang ringan dulu.",
      },
      {
        authorEmail: pharmacists[2].email,
        parentKey: "ors-answer",
        createdAt: new Date("2026-08-11T04:04:00.000Z"),
        bodyMarkdown:
          "Segera cari bantuan kalau ada darah pada BAB, demam tinggi, muntah terus, sangat lemas, tanda dehidrasi, atau diare tidak membaik.",
      },
    ],
  },
] as const

type SeedForumUser = {
  id: string
  email: string
}

type SeedForumCategory = {
  id: string
  slug: string
}

type SeedForumPost = {
  id: string
}

type SeedForumReply = {
  authorEmail: string
  bodyMarkdown: string
  createdAt: Date
  key?: string
  parentKey?: string
}

function markdownList(items: readonly string[]) {
  return items.map((item) => `- ${item}`).join("\n")
}

function contentCategorySlug(name: string) {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "kategori"
  )
}

function getDemoPharmacistDrugData(genericName: string) {
  return {
    drugClass: "Data demo: golongan obat perlu diverifikasi apoteker",
    dosageForm: "Data demo: bentuk sediaan mengikuti produk yang digunakan",
    pharmacistIndications: `Data demo untuk apoteker: evaluasi kesesuaian penggunaan ${genericName} berdasarkan keluhan, riwayat pasien, dan obat lain yang digunakan.`,
    counselingPoints: [
      "Pastikan pasien memahami cara pakai pada label atau arahan tenaga kesehatan.",
      "Tanyakan obat lain yang sedang digunakan untuk menghindari duplikasi atau interaksi.",
      "Ingatkan pasien bahwa data ini masih demo dan perlu validasi konten produksi.",
    ],
    screeningQuestions: [
      "Siapa yang akan menggunakan obat ini?",
      "Apa keluhan utama dan sejak kapan terjadi?",
      "Apakah ada riwayat alergi obat, kehamilan, menyusui, atau penyakit kronis?",
      "Obat, suplemen, atau produk herbal apa yang sedang digunakan?",
    ],
    contraindications: [
      "Data demo: cek kontraindikasi spesifik sesuai monografi resmi.",
      "Rujuk atau konsultasikan bila ada riwayat reaksi alergi berat terhadap kandungan obat.",
    ],
    majorInteractions: [
      "Data demo: telaah interaksi dengan obat rutin pasien sebelum rekomendasi.",
      "Waspadai penggunaan bersama obat dengan efek samping atau kandungan yang serupa.",
    ],
    seriousSideEffects: [
      "Reaksi alergi berat seperti sesak, bengkak wajah, atau ruam luas.",
      "Keluhan berat, menetap, atau memburuk setelah penggunaan obat.",
    ],
    monitoringParameters: [
      "Perbaikan gejala dan durasi keluhan.",
      "Munculnya efek samping atau tanda bahaya.",
      "Kepatuhan terhadap petunjuk pakai pada label atau resep.",
    ],
    referralCriteria: [
      "Gejala berat, memburuk, atau tidak membaik sesuai batas waktu wajar.",
      "Pasien berisiko tinggi seperti bayi, lansia, hamil, menyusui, atau memiliki penyakit kronis.",
      "Ada tanda bahaya yang membutuhkan pemeriksaan tenaga kesehatan.",
    ],
    internalNotes:
      "Konten seed ini hanya demo untuk pengujian mode apoteker. Jangan gunakan sebagai rujukan klinis produksi.",
    references: [
      "Data demo Medisigna - perlu diganti dengan referensi monografi resmi.",
      "Validasi akhir wajib oleh apoteker terverifikasi sebelum produksi.",
    ],
    reviewDueAt: new Date("2026-12-25T00:00:00.000Z"),
  }
}

async function main() {
  const adminUser = await db.user.upsert({
    where: { email: admin.email },
    create: {
      id: randomUUID(),
      name: admin.name,
      email: admin.email,
      emailVerified: true,
      role: "ADMIN",
      status: "ACTIVE",
    },
    update: {
      name: admin.name,
      role: "ADMIN",
      status: "ACTIVE",
    },
  })

  const adminHashedPassword = await hashPassword(adminPassword)
  const adminCredentialAccount = await db.account.findFirst({
    where: { userId: adminUser.id, providerId: "credential" },
  })

  if (adminCredentialAccount) {
    await db.account.update({
      where: { id: adminCredentialAccount.id },
      data: { accountId: adminUser.id, password: adminHashedPassword },
    })
  } else {
    await db.account.create({
      data: {
        id: randomUUID(),
        accountId: adminUser.id,
        providerId: "credential",
        userId: adminUser.id,
        password: adminHashedPassword,
      },
    })
  }

  for (const pharmacist of pharmacists) {
    const user = await db.user.upsert({
      where: { email: pharmacist.email },
      create: {
        id: randomUUID(),
        name: pharmacist.name,
        email: pharmacist.email,
        emailVerified: true,
        phone: pharmacist.phone,
        role: "PHARMACIST",
        status: "ACTIVE",
      },
      update: {
        name: pharmacist.name,
        phone: pharmacist.phone,
        role: "PHARMACIST",
        status: "ACTIVE",
      },
    })

    const password = await hashPassword(pharmacistPassword)
    const credentialAccount = await db.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    })

    if (credentialAccount) {
      await db.account.update({
        where: { id: credentialAccount.id },
        data: { accountId: user.id, password },
      })
    } else {
      await db.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password,
        },
      })
    }

    await db.pharmacistProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        title: pharmacist.title,
        strNumber: pharmacist.strNumber,
        bio: "Apoteker terverifikasi untuk konseling obat dan edukasi penggunaan obat yang aman.",
        topics: [...pharmacist.topics],
        practiceLocation: pharmacist.practiceLocation,
        serviceHours: pharmacist.serviceHours,
        experienceSummary: "Berpengalaman mendampingi pasien memahami aturan pakai, efek samping, dan keamanan obat.",
        verificationStatus: "VERIFIED",
        availabilityStatus: pharmacist.availabilityStatus,
      },
      update: {
        title: pharmacist.title,
        bio: "Apoteker terverifikasi untuk konseling obat dan edukasi penggunaan obat yang aman.",
        topics: [...pharmacist.topics],
        practiceLocation: pharmacist.practiceLocation,
        serviceHours: pharmacist.serviceHours,
        experienceSummary: "Berpengalaman mendampingi pasien memahami aturan pakai, efek samping, dan keamanan obat.",
        verificationStatus: "VERIFIED",
        availabilityStatus: pharmacist.availabilityStatus,
      },
    })
  }

  for (const patient of demoPatients) {
    const user = await db.user.upsert({
      where: { email: patient.email },
      create: {
        id: randomUUID(),
        name: patient.name,
        email: patient.email,
        emailVerified: true,
        phone: patient.phone,
        role: "PATIENT",
        status: "ACTIVE",
      },
      update: {
        name: patient.name,
        phone: patient.phone,
        role: "PATIENT",
        status: "ACTIVE",
      },
    })

    const password = await hashPassword(patientPassword)
    const credentialAccount = await db.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    })

    if (credentialAccount) {
      await db.account.update({
        where: { id: credentialAccount.id },
        data: { accountId: user.id, password },
      })
    } else {
      await db.account.create({
        data: {
          id: randomUUID(),
          accountId: user.id,
          providerId: "credential",
          userId: user.id,
          password,
        },
      })
    }
  }

  const reviewer = await db.user.findUniqueOrThrow({
    where: { email: pharmacists[0].email },
  })
  const reviewedAt = new Date("2026-06-25T00:00:00.000Z")
  const contentCategories = [
    ...new Set([
      ...demoArticles.map((article) => article.category),
      ...demoEducationalVideos.map((video) => video.category),
    ]),
  ]

  for (const category of contentCategories) {
    await db.contentCategory.upsert({
      where: { name: category },
      create: {
        name: category,
        slug: contentCategorySlug(category),
        isActive: true,
      },
      update: {
        slug: contentCategorySlug(category),
        isActive: true,
      },
    })
  }

  for (const article of demoArticles) {
    await db.article.upsert({
      where: { slug: article.slug },
      create: {
        ...article,
        status: "PUBLISHED",
        authorId: reviewer.id,
        reviewedAt: article.publishedAt,
      },
      update: {
        ...article,
        status: "PUBLISHED",
        authorId: reviewer.id,
        reviewedAt: article.publishedAt,
      },
    })
  }

  for (const video of demoEducationalVideos) {
    const youtubeUrl = `https://www.youtube.com/watch?v=${video.youtubeVideoId}`

    await db.educationalVideo.upsert({
      where: { slug: video.slug },
      create: {
        ...video,
        youtubeUrl,
        metaTitle: `${video.title} | Medisigna`,
        metaDescription: video.excerpt,
        status: "PUBLISHED",
        authorId: reviewer.id,
        reviewedAt: video.publishedAt,
      },
      update: {
        ...video,
        youtubeUrl,
        metaTitle: `${video.title} | Medisigna`,
        metaDescription: video.excerpt,
        status: "PUBLISHED",
        authorId: reviewer.id,
        reviewedAt: video.publishedAt,
      },
    })
  }

  for (const drug of demoDrugs) {
    const pharmacistDrugData = getDemoPharmacistDrugData(drug.genericName)

    await db.drugInformation.upsert({
      where: { slug: drug.slug },
      create: {
        ...drug,
        ...pharmacistDrugData,
        brandNames: [...drug.brandNames],
        aliases: [...drug.aliases],
        commonSideEffects: markdownList(drug.commonSideEffects),
        warnings: markdownList(drug.warnings),
        seekHelpWhen: markdownList(drug.seekHelpWhen),
        reviewerId: reviewer.id,
        reviewedAt,
        status: "PUBLISHED",
        isDemo: true,
      },
      update: {
        ...drug,
        ...pharmacistDrugData,
        brandNames: [...drug.brandNames],
        aliases: [...drug.aliases],
        commonSideEffects: markdownList(drug.commonSideEffects),
        warnings: markdownList(drug.warnings),
        seekHelpWhen: markdownList(drug.seekHelpWhen),
        reviewerId: reviewer.id,
        reviewedAt,
        status: "PUBLISHED",
        isDemo: true,
      },
    })
  }

  const forumUsers = (await db.user.findMany({
    where: {
      email: {
        in: [
          ...demoPatients.map((patient) => patient.email),
          ...pharmacists.map((pharmacist) => pharmacist.email),
        ],
      },
    },
  })) as SeedForumUser[]
  const forumUsersByEmail = new Map(
    forumUsers.map((user: SeedForumUser) => [user.email, user])
  )

  for (const category of demoForumCategories) {
    await db.forumCategory.upsert({
      where: { slug: category.slug },
      create: {
        id: randomUUID(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
      },
      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },
    })
  }

  const forumCategories = (await db.forumCategory.findMany({
    where: {
      slug: {
        in: demoForumCategories.map((category) => category.slug),
      },
    },
  })) as SeedForumCategory[]
  const forumCategoriesBySlug = new Map(
    forumCategories.map((category: SeedForumCategory) => [category.slug, category])
  )

  for (const threadSeed of demoForumThreads) {
    const author = forumUsersByEmail.get(threadSeed.authorEmail)
    const category = forumCategoriesBySlug.get(threadSeed.categorySlug)
    const lastPostAt =
      threadSeed.replies[threadSeed.replies.length - 1]?.createdAt ??
      threadSeed.createdAt

    if (!author || !category) {
      throw new Error(`Forum seed invalid for thread: ${threadSeed.slug}`)
    }

    const thread = (await db.forumThread.upsert({
      where: { slug: threadSeed.slug },
      create: {
        id: randomUUID(),
        title: threadSeed.title,
        slug: threadSeed.slug,
        categoryId: category.id,
        authorId: author.id,
        status: "ACTIVE",
        isPinned: false,
        lastPostAt,
        createdAt: threadSeed.createdAt,
        updatedAt: lastPostAt,
      },
      update: {
        title: threadSeed.title,
        categoryId: category.id,
        authorId: author.id,
        status: "ACTIVE",
        isPinned: false,
        hiddenAt: null,
        hiddenById: null,
        hiddenReason: null,
        lockedAt: null,
        lockedById: null,
        lastPostAt,
        updatedAt: lastPostAt,
      },
    })) as SeedForumPost

    await db.forumPost.deleteMany({
      where: { threadId: thread.id },
    })

    const firstPost = (await db.forumPost.create({
      data: {
        id: randomUUID(),
        threadId: thread.id,
        authorId: author.id,
        bodyMarkdown: threadSeed.bodyMarkdown,
        status: "VISIBLE",
        createdAt: threadSeed.createdAt,
        updatedAt: threadSeed.createdAt,
      },
    })) as SeedForumPost
    const forumPostsByKey = new Map<string, string>([["root", firstPost.id]])

    for (const [index, reply] of (threadSeed.replies as readonly SeedForumReply[]).entries()) {
      const replyAuthor = forumUsersByEmail.get(reply.authorEmail)
      const parentPostId = forumPostsByKey.get(reply.parentKey ?? "root")

      if (!replyAuthor || !parentPostId) {
        throw new Error(`Forum reply seed invalid for thread: ${threadSeed.slug}`)
      }

      const post = (await db.forumPost.create({
        data: {
          id: randomUUID(),
          threadId: thread.id,
          parentPostId,
          authorId: replyAuthor.id,
          bodyMarkdown: reply.bodyMarkdown,
          status: "VISIBLE",
          createdAt: reply.createdAt,
          updatedAt: reply.createdAt,
        },
      })) as SeedForumPost

      forumPostsByKey.set(reply.key ?? `reply-${index}`, post.id)
    }
  }

  console.log(
    `Seeded admin (${admin.email} / ${adminPassword}), ${pharmacists.length} verified pharmacists, ${demoPatients.length} patients, ${demoDrugs.length} demo drugs, ${demoArticles.length} articles, ${demoEducationalVideos.length} educational videos, and ${demoForumThreads.length} forum discussions. Pharmacist password: ${pharmacistPassword}. Patient password: ${patientPassword}`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.$disconnect()
  })
