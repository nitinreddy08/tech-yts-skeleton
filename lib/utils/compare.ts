import type { ProductDetail, SpecDiffRow } from '@/types'

export function buildSpecDiffTable(products: ProductDetail[]): SpecDiffRow[] {
  if (products.length < 2) return []

  const specFields = products[0].category.spec_template.fields
  const rows: SpecDiffRow[] = []

  for (const field of specFields) {
    const values = products.map(
      (p) => p.specifications[field.key] ?? null
    )

    // Skip all-null rows
    if (values.every((v) => v === null)) continue

    // hasDiff: at least two products differ on this key
    const nonNullValues = values.filter((v) => v !== null)
    const uniqueValues = new Set(nonNullValues.map(String))
    const hasDiff = uniqueValues.size > 1

    rows.push({
      specKey: field.key,
      label: field.label,
      values,
      hasDiff,
    })
  }

  return rows
}
