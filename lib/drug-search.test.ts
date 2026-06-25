import assert from "node:assert/strict"
import { describe, test } from "node:test"

import { filterDrugs } from "@/lib/drug-search"

const drugs = [
  {
    genericName: "Parasetamol",
    brandNames: ["Panadol"],
    aliases: ["Paracetamol", "Acetaminophen"],
  },
  {
    genericName: "Ibuprofen",
    brandNames: ["Proris"],
    aliases: ["Ibuprofenum"],
  },
]

describe("filterDrugs", () => {
  test("returns every drug for an empty query", () => {
    assert.equal(filterDrugs(drugs, "  ").length, 2)
  })

  test("matches generic names, brands, and aliases without case sensitivity", () => {
    assert.equal(filterDrugs(drugs, "PARASETAMOL").length, 1)
    assert.equal(filterDrugs(drugs, "panadol").length, 1)
    assert.equal(filterDrugs(drugs, "acetAMINophen").length, 1)
  })

  test("returns an empty list when nothing matches", () => {
    assert.deepEqual(filterDrugs(drugs, "amoksisilin"), [])
  })
})
