/**
 * Property-based tests for product validation logic.
 * Validates: Requirements 9.7, 9.11
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { z } from 'zod'

// ── Schema (replicated from actions.ts) ──────────────────────────────────────

const AffiliateLinkSchema = z.object({
  store_name: z.string().min(1),
  store_icon: z.string().nullable().optional(),
  affiliate_url: z.string().url(),
  price_inr: z.number().nullable().optional(),
  last_updated: z.string().optional(),
})

const ProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  category_id: z.string().min(1),
  brand_id: z.string().min(1),
  specifications: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  creator_rating: z.number().min(0).max(10),
  thumbnail_url: z.string().min(1),
  gallery_images: z.array(z.string()),
  is_featured: z.boolean(),
  is_deal_of_the_day: z.boolean(),
  is_published: z.boolean(),
  tags: z.array(z.string()),
  affiliate_links: z.array(AffiliateLinkSchema),
  faqs: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
      display_order: z.number().int().default(0),
    })
  ),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  youtube_video_url: z.string().nullable().optional(),
  youtube_short_url: z.string().nullable().optional(),
  launch_price_inr: z.number().nullable().optional(),
  current_price_inr: z.number().nullable().optional(),
  deal_badge_text: z.string().nullable().optional(),
})

// ── Publish guard (replicated from actions.ts) ───────────────────────────────

function validatePublishGuards(data: z.infer<typeof ProductSchema>): string | null {
  if (data.is_published) {
    if (!data.thumbnail_url) return 'Cannot publish: thumbnail is required.'
    if (!data.affiliate_links.length) return 'Cannot publish: at least one affiliate link is required.'
  }
  return null
}

// ── Base valid product ───────────────────────────────────────────────────────

const baseProduct: z.infer<typeof ProductSchema> = {
  name: 'Test Product',
  slug: 'test-product',
  category_id: 'cat-1',
  brand_id: 'brand-1',
  specifications: {},
  pros: [],
  cons: [],
  creator_rating: 5,
  thumbnail_url: 'https://example.com/thumb.jpg',
  gallery_images: [],
  is_featured: false,
  is_deal_of_the_day: false,
  is_published: false,
  tags: [],
  affiliate_links: [],
  faqs: [],
}

// ── Arbitraries ──────────────────────────────────────────────────────────────

const affiliateLinkArb = fc.record({
  store_name: fc.string({ minLength: 1, maxLength: 50 }),
  store_icon: fc.option(fc.string(), { nil: null }),
  affiliate_url: fc.webUrl(),
  price_inr: fc.option(fc.float({ min: 0, max: 100000, noNaN: true }), { nil: null }),
  last_updated: fc.option(fc.string(), { nil: undefined }),
})

// ── Property 22: Published product affiliate link requirement ────────────────
// Validates: Requirements 9.11

describe('Property 22: Published product affiliate link requirement', () => {
  it('is_published=true with empty affiliate_links returns the affiliate link error', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.array(affiliateLinkArb, { minLength: 0, maxLength: 3 }),
        (is_published, affiliate_links) => {
          const product = { ...baseProduct, is_published, affiliate_links }
          const result = validatePublishGuards(product)

          if (is_published && affiliate_links.length === 0) {
            expect(result).toBe('Cannot publish: at least one affiliate link is required.')
          } else if (is_published && affiliate_links.length > 0) {
            expect(result).toBeNull()
          } else {
            // not published — guard never fires
            expect(result).toBeNull()
          }
        }
      )
    )
  })
})

// ── Property 23: Product creator_rating bounds ───────────────────────────────
// Validates: Requirements 9.7

describe('Property 23: Product creator_rating bounds', () => {
  it('schema accepts ratings in [0, 10] and rejects those outside', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -100, max: 100, noNaN: true }),
        (rating) => {
          const result = ProductSchema.safeParse({ ...baseProduct, creator_rating: rating })
          const inBounds = rating >= 0 && rating <= 10
          expect(result.success).toBe(inBounds)
        }
      )
    )
  })
})
