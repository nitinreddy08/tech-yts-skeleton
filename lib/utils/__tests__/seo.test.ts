import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { generateProductMetadata, generateProductJsonLd } from '../seo'
import type { ProductDetail, AffiliateLink } from '@/types'
import { siteConfig } from '@/lib/config'

// Minimal arbitraries

const affiliateLinkArb: fc.Arbitrary<AffiliateLink> = fc.record({
  id: fc.uuid(),
  product_id: fc.uuid(),
  store_name: fc.string({ minLength: 1, maxLength: 50 }),
  store_icon: fc.constant(null),
  affiliate_url: fc.webUrl(),
  price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 1000000 })),
  is_best_price: fc.boolean(),
  last_updated: fc.constant('2024-01-01T00:00:00Z'),
})

const productArb: fc.Arbitrary<ProductDetail> = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.array(affiliateLinkArb, { minLength: 0, maxLength: 5 }),
  )
  .map(([name, affiliate_links]) => ({
    id: 'prod-1',
    name,
    slug: 'test-product',
    category_id: 'cat-1',
    category_slug: 'cameras',
    brand_id: 'brand-1',
    brand_name: 'TestBrand',
    thumbnail_url: 'https://example.com/thumb.jpg',
    creator_rating: 8,
    current_price_inr: null,
    launch_price_inr: null,
    is_featured: false,
    is_deal_of_the_day: false,
    deal_badge_text: null,
    tags: [],
    youtube_video_url: null,
    created_at: '2024-01-01T00:00:00Z',
    tagline: null,
    description: null,
    specifications: {},
    pros: [],
    cons: [],
    youtube_short_url: null,
    gallery_images: [],
    is_published: true,
    updated_at: '2024-01-01T00:00:00Z',
    affiliate_links,
    faqs: [],
    category: {
      id: 'cat-1',
      name: 'Cameras',
      slug: 'cameras',
      icon: '📷',
      description: null,
      spec_template: { fields: [] },
      display_order: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
    brand: {
      id: 'brand-1',
      name: 'TestBrand',
      slug: 'testbrand',
      logo_url: null,
    },
  }))

/**
 * Validates: Requirements 2.7, 12.1
 *
 * Property 17: generateProductMetadata title format
 * title equals `"{name} Review & Price in India | {site_name}"`
 * site_name comes from the hardcoded siteConfig constant.
 */
describe('generateProductMetadata', () => {
  it('Property 17: title equals "{name} Review & Price in India | {site_name}"', () => {
    fc.assert(
      fc.property(productArb, (product) => {
        const metadata = generateProductMetadata(product)
        const expected = `${product.name} Review & Price in India | ${siteConfig.site_name}`
        expect(metadata.title).toBe(expected)
      }),
    )
  })
})

/**
 * Validates: Requirements 2.4, 12.1
 *
 * Property 18: generateProductJsonLd offers count
 * offers.length equals affiliateLinks.length
 */
describe('generateProductJsonLd', () => {
  it('Property 18: offers.length equals affiliateLinks.length', () => {
    fc.assert(
      fc.property(
        productArb,
        fc.array(affiliateLinkArb, { minLength: 0, maxLength: 5 }),
        (product, affiliateLinks) => {
          const jsonLd = generateProductJsonLd(product, affiliateLinks)
          const offers = Array.isArray(jsonLd.offers) ? jsonLd.offers : []
          expect(offers.length).toBe(affiliateLinks.length)
        },
      ),
    )
  })
})
