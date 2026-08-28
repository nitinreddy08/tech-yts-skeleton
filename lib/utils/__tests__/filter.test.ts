import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { filterAndSortProducts } from '../filter'
import type { ProductSummary, ProductFilters, SortOption } from '@/types'

// Arbitrary for ProductSummary
const productArb: fc.Arbitrary<ProductSummary> = fc.record({
  id: fc.uuid(),
  name: fc.string(),
  slug: fc.string(),
  category_id: fc.uuid(),
  category_slug: fc.string(),
  brand_id: fc.uuid(),
  brand_name: fc.string(),
  thumbnail_url: fc.string(),
  creator_rating: fc.float({ min: 0, max: 10, noNaN: true }),
  current_price_inr: fc.oneof(fc.integer({ min: 0, max: 200000 }), fc.constant(null)),
  launch_price_inr: fc.oneof(fc.integer({ min: 0, max: 200000 }), fc.constant(null)),
  is_featured: fc.boolean(),
  is_deal_of_the_day: fc.boolean(),
  deal_badge_text: fc.constant(null),
  tags: fc.array(fc.string()),
  youtube_video_url: fc.constant(null),
  created_at: fc.string(),
})

const sortOptionArb: fc.Arbitrary<SortOption> = fc.constantFrom(
  'price_asc',
  'price_desc',
  'rating_desc',
  'newest',
  'popular'
)

// Generates a filters object that may activate brand, priceRange, and/or rating filters
const filtersArb = (products: ProductSummary[]): fc.Arbitrary<ProductFilters> => {
  const brandNames = [...new Set(products.map((p) => p.brand_name))]
  return fc.record({
    brands: fc.oneof(
      fc.constant(undefined),
      fc.subarray(brandNames)
    ),
    priceRange: fc.oneof(
      fc.constant(undefined),
      fc.tuple(
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 0, max: 100000 })
      ).map(([a, b]) => ({ min: Math.min(a, b), max: Math.max(a, b) }))
    ),
    rating: fc.oneof(
      fc.constant(undefined),
      fc.float({ min: 0, max: 10 })
    ),
  })
}

/**
 * Property 12: Subset correctness
 * Every product returned by filterAndSortProducts satisfies all active filters.
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */
describe('Property 12: subset correctness', () => {
  it('every returned product satisfies all active filters', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        sortOptionArb,
        (products, sort) => {
          return fc.sample(filtersArb(products), 1).every((filters) => {
            const result = filterAndSortProducts(products, filters, sort)

            return result.every((product) => {
              // Brand filter
              if (filters.brands && filters.brands.length > 0) {
                if (!filters.brands.includes(product.brand_name)) return false
              }

              // Price range filter
              if (filters.priceRange) {
                const price = product.current_price_inr
                if (price === null) return false
                if (price < filters.priceRange.min || price > filters.priceRange.max) return false
              }

              // Rating filter
              if (filters.rating !== undefined) {
                if (product.creator_rating < filters.rating) return false
              }

              return true
            })
          })
        }
      )
    )
  })
})

/**
 * Property 13: Immutability
 * The original products array and its elements are unchanged after calling filterAndSortProducts.
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */
describe('Property 13: immutability', () => {
  it('original array is unchanged after filterAndSortProducts call', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        sortOptionArb,
        (products, sort) => {
          return fc.sample(filtersArb(products), 1).every((filters) => {
            const originalIds = products.map((p) => p.id)
            const originalSnapshots = products.map((p) => ({ ...p }))

            filterAndSortProducts(products, filters, sort)

            // Array length unchanged
            if (products.length !== originalIds.length) return false

            // Each element at each index is unchanged
            for (let i = 0; i < products.length; i++) {
              const orig = originalSnapshots[i]
              const curr = products[i]
              if (
                curr.id !== orig.id ||
                curr.brand_name !== orig.brand_name ||
                curr.current_price_inr !== orig.current_price_inr ||
                curr.creator_rating !== orig.creator_rating
              ) {
                return false
              }
            }

            return true
          })
        }
      )
    )
  })
})

/**
 * Property 14: Idempotency
 * Applying the same filter twice equals applying it once.
 * Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */
describe('Property 14: idempotency', () => {
  it('filtering the result again with the same filters yields the same result', () => {
    fc.assert(
      fc.property(
        fc.array(productArb, { minLength: 0, maxLength: 20 }),
        sortOptionArb,
        (products, sort) => {
          return fc.sample(filtersArb(products), 1).every((filters) => {
            const once = filterAndSortProducts(products, filters, sort)
            const twice = filterAndSortProducts(once, filters, sort)

            if (once.length !== twice.length) return false

            for (let i = 0; i < once.length; i++) {
              if (once[i].id !== twice[i].id) return false
            }

            return true
          })
        }
      )
    )
  })
})
