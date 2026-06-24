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

  console.log(
    `Seeded ${pharmacists.length} verified pharmacists with password: ${pharmacistPassword}`
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
