"use server"

import { db } from "@/lib/db"
import { requireRole } from "@/lib/session"
import { fail, ok, value } from "../shared"

export async function savePatientProfile(formData: FormData) {
  const user = await requireRole("PATIENT")
  const ageText = value(formData, "age")
  const birthDateText = value(formData, "birthDate")
  const parsedAge = ageText ? Number(ageText) : null

  if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 0)) fail("/dashboard/profile", "Umur tidak valid.")

  await db.patientProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      age: parsedAge,
      birthDate: birthDateText ? new Date(birthDateText) : null,
      phone: value(formData, "phone") || null,
      gender: value(formData, "gender") || null,
      address: value(formData, "address") || null,
    },
    update: {
      age: parsedAge,
      birthDate: birthDateText ? new Date(birthDateText) : null,
      phone: value(formData, "phone") || null,
      gender: value(formData, "gender") || null,
      address: value(formData, "address") || null,
    },
  })

  ok("/dashboard/profile")
}
