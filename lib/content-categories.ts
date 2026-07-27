import { Prisma } from "@prisma/client"

import { db } from "@/lib/db"

export type ContentCategory = {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export function contentCategorySlug(name: string) {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "kategori"
  )
}

export async function uniqueContentCategorySlug(name: string, currentId?: string) {
  const base = contentCategorySlug(name)

  for (let suffix = 1; ; suffix += 1) {
    const slug = suffix === 1 ? base : `${base}-${suffix}`
    const rows = await db.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "ContentCategory"
      WHERE slug = ${slug}
        ${currentId ? Prisma.sql`AND id <> ${currentId}` : Prisma.empty}
      LIMIT 1
    `

    if (!rows.length) return slug
  }
}

export async function getContentCategories({
  activeOnly = false,
}: { activeOnly?: boolean } = {}): Promise<ContentCategory[]> {
  return db.$queryRaw<ContentCategory[]>`
    SELECT id, name, slug, "isActive", "createdAt", "updatedAt"
    FROM "ContentCategory"
    WHERE 1 = 1
      ${activeOnly ? Prisma.sql`AND "isActive" = true` : Prisma.empty}
    ORDER BY name ASC
  `
}

export async function getCategoryNamesForForm(_currentCategory?: string | null): Promise<string[]> {
  const categories = await getContentCategories({ activeOnly: true })
  const names = categories.map((category) => category.name)

  return names.sort((a, b) => a.localeCompare(b, "id-ID"))
}

export async function activeContentCategoryExists(name: string) {
  const rows = await db.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "ContentCategory"
    WHERE LOWER(name) = LOWER(${name})
      AND "isActive" = true
    LIMIT 1
  `

  return rows.length > 0
}

export async function duplicateContentCategoryName(name: string, currentId?: string) {
  const rows = await db.$queryRaw<Array<{ id: string }>>`
    SELECT id
    FROM "ContentCategory"
    WHERE LOWER(name) = LOWER(${name})
      ${currentId ? Prisma.sql`AND id <> ${currentId}` : Prisma.empty}
    LIMIT 1
  `

  return rows.length > 0
}
