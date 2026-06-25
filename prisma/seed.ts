import "dotenv/config"

import { randomUUID } from "node:crypto"
import { hashPassword } from "better-auth/crypto"

import { db } from "../lib/db"

const pharmacistPassword = "Apoteker123!"

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

async function main() {
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

  const reviewer = await db.user.findUniqueOrThrow({
    where: { email: pharmacists[0].email },
  })
  const reviewedAt = new Date("2026-06-25T00:00:00.000Z")

  for (const drug of demoDrugs) {
    await db.drugInformation.upsert({
      where: { slug: drug.slug },
      create: {
        ...drug,
        brandNames: [...drug.brandNames],
        aliases: [...drug.aliases],
        commonSideEffects: [...drug.commonSideEffects],
        warnings: [...drug.warnings],
        seekHelpWhen: [...drug.seekHelpWhen],
        reviewerId: reviewer.id,
        reviewedAt,
        status: "PUBLISHED",
        isDemo: true,
      },
      update: {
        ...drug,
        brandNames: [...drug.brandNames],
        aliases: [...drug.aliases],
        commonSideEffects: [...drug.commonSideEffects],
        warnings: [...drug.warnings],
        seekHelpWhen: [...drug.seekHelpWhen],
        reviewerId: reviewer.id,
        reviewedAt,
        status: "PUBLISHED",
        isDemo: true,
      },
    })
  }

  console.log(
    `Seeded ${pharmacists.length} verified pharmacists and ${demoDrugs.length} demo drugs with password: ${pharmacistPassword}`
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
