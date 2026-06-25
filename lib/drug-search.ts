export type SearchableDrug = {
  genericName: string
  brandNames: string[]
  aliases: string[]
}

export function filterDrugs<T extends SearchableDrug>(drugs: T[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
  if (!normalizedQuery) return drugs

  return drugs.filter((drug) =>
    [drug.genericName, ...drug.brandNames, ...drug.aliases].some((term) =>
      term.toLocaleLowerCase("id-ID").includes(normalizedQuery)
    )
  )
}
