import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { buildSpecDiffTable } from '../compare'
import type { ProductDetail, SpecField, SpecTemplate, Category, Brand } from '@/types'

// Fixed spec fields shared across all generated products
const SPEC_FIELDS: SpecField[] = [
  { key: 'display_size', label: 'Display Size', type: 'text' },
  { key: 'ram', label: 'RAM', type: 'text' },
  { key: 'battery', label: 'Battery', type: 'text' },
]

const SPEC_TEMPLATE: SpecTemplate = { fields: SPEC_FIELDS }

const SPEC_KEYS = SPEC_FIELDS.map((f) => f.key)

// Arbitrary for a single spec value: string or null
const specValueArb: fc.Arbitrary<string | null> = fc.oneof(
  fc.constant(null),
  fc.string({ minLength: 1, maxLength: 20 })
)

// Arbitrary for a minimal Category with the fixed spec_template
const categoryArb: fc.Arbitrary<Category> = fc.record({
  id: fc.uuid(),
  name: fc.string(),
  slug: fc.string(),
  icon: fc.string(),
  description: fc.constant(null),
  spec_template: fc.constant(SPEC_TEMPLATE),
  display_order: fc.integer({ min: 0, max: 10 }),
  created_at: fc.constant('2024-01-01T00:00:00Z'),
})

// Arbitrary for a minimal Brand
const brandArb: fc.Arbitrary<Brand> = fc.record({
  id: fc.uuid(),
  name: fc.string(),
  slug: fc.string(),
  logo_url: fc.constant(null),
})

// Build a ProductDetail arbitrary given a shared category
function makeProductArb(category: Category): fc.Arbitrary<ProductDetail> {
  return fc.record({
    // ProductSummary fields
    id: fc.uuid(),
    name: fc.string(),
    slug: fc.string(),
    category_id: fc.constant(category.id),
    category_slug: fc.constant(category.slug),
    brand_id: fc.uuid(),
    brand_name: fc.string(),
    thumbnail_url: fc.constant(''),
    creator_rating: fc.float({ min: 0, max: 10 }),
    current_price_inr: fc.constant(null),
    launch_price_inr: fc.constant(null),
    is_featured: fc.boolean(),
    is_deal_of_the_day: fc.boolean(),
    deal_badge_text: fc.constant(null),
    tags: fc.constant([]),
    youtube_video_url: fc.constant(null),
    created_at: fc.constant('2024-01-01T00:00:00Z'),
    // ProductDetail extra fields
    tagline: fc.constant(null),
    description: fc.constant(null),
    specifications: fc.record(
      Object.fromEntries(SPEC_KEYS.map((k) => [k, specValueArb]))
    ) as fc.Arbitrary<Record<string, string | null>>,
    pros: fc.constant([]),
    cons: fc.constant([]),
    youtube_short_url: fc.constant(null),
    gallery_images: fc.constant([]),
    is_published: fc.boolean(),
    updated_at: fc.constant('2024-01-01T00:00:00Z'),
    affiliate_links: fc.constant([]),
    faqs: fc.constant([]),
    category: fc.constant(category),
    brand: brandArb,
  }) as fc.Arbitrary<ProductDetail>
}

// Arbitrary for 2–4 products sharing the same category
const productsArb: fc.Arbitrary<ProductDetail[]> = categoryArb.chain((category) =>
  fc.array(makeProductArb(category), { minLength: 2, maxLength: 4 })
)

/**
 * Property 6: hasDiff correctness
 * hasDiff === true iff at least two products have different non-null values for that specKey.
 * **Validates: Requirements 5.5, 5.6**
 */
describe('Property 6: hasDiff correctness', () => {
  it('hasDiff is true iff at least two products have different non-null values for that specKey', () => {
    fc.assert(
      fc.property(productsArb, (products) => {
        const rows = buildSpecDiffTable(products)

        for (const row of rows) {
          const nonNullValues = row.values.filter((v) => v !== null)
          const uniqueNonNull = new Set(nonNullValues.map(String))
          const expectedHasDiff = uniqueNonNull.size > 1

          if (row.hasDiff !== expectedHasDiff) return false
        }

        return true
      })
    )
  })
})

/**
 * Property 7: excludes all-null rows
 * No row in the output has all-null values array.
 * **Validates: Requirements 5.5, 5.6**
 */
describe('Property 7: excludes all-null rows', () => {
  it('no row in output has all values null', () => {
    fc.assert(
      fc.property(productsArb, (products) => {
        const rows = buildSpecDiffTable(products)

        for (const row of rows) {
          if (row.values.every((v) => v === null)) return false
        }

        return true
      })
    )
  })
})
