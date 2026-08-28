// Feature: ui-redesign — shared fast-check arbitraries
// Generates valid objects matching types from types/index.ts

import * as fc from 'fast-check'
import type {
  ProductSummary,
  AffiliateLink,
  Deal,
  Category,
  BestOfListItem,
} from '@/types'

export const arbitraryProductSummary = (): fc.Arbitrary<ProductSummary> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 60 }),
    slug: fc.stringMatching(/^[a-z0-9-]{1,30}$/),
    category_id: fc.uuid(),
    category_slug: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
    brand_id: fc.uuid(),
    brand_name: fc.string({ minLength: 1, maxLength: 40 }),
    thumbnail_url: fc.oneof(fc.constant(''), fc.constant('https://example.com/thumb.jpg')),
    creator_rating: fc.float({ min: 0, max: 10, noNaN: true }),
    current_price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 1000, max: 500000 })),
    launch_price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 1000, max: 500000 })),
    is_featured: fc.boolean(),
    is_deal_of_the_day: fc.boolean(),
    deal_badge_text: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 30 })),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    youtube_video_url: fc.oneof(fc.constant(null), fc.constant('https://youtube.com/watch?v=test')),
    created_at: fc.constant('2024-01-01T00:00:00Z'),
  })

export const arbitraryAffiliateLink = (): fc.Arbitrary<AffiliateLink> =>
  fc.record({
    id: fc.uuid(),
    product_id: fc.uuid(),
    store_name: fc.string({ minLength: 1, maxLength: 40 }),
    store_icon: fc.oneof(fc.constant(null), fc.constant('https://example.com/icon.png')),
    affiliate_url: fc.constant('https://example.com/buy'),
    price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 1000, max: 500000 })),
    is_best_price: fc.boolean(),
    last_updated: fc.constant('2024-01-01T00:00:00Z'),
  })

export const arbitraryDeal = (): fc.Arbitrary<Deal> =>
  fc.record({
    id: fc.uuid(),
    product_id: fc.uuid(),
    deal_type: fc.constantFrom(
      'deal_of_day',
      'price_drop',
      'upcoming_sale',
      'bank_offer',
      'sale_event',
      'coupon'
    ) as fc.Arbitrary<Deal['deal_type']>,
    headline: fc.string({ minLength: 1, maxLength: 80 }),
    original_price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 1000, max: 500000 })),
    deal_price_inr: fc.oneof(fc.constant(null), fc.integer({ min: 500, max: 400000 })),
    store_name: fc.string({ minLength: 1, maxLength: 40 }),
    affiliate_url: fc.constant('https://example.com/buy'),
    starts_at: fc.constant(null),
    expires_at: fc.constant(null),
    is_active: fc.boolean(),
    created_at: fc.constant('2024-01-01T00:00:00Z'),
    product: fc.oneof(fc.constant(undefined), arbitraryProductSummary()),
  })

export const arbitraryCategory = (): fc.Arbitrary<Category> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 40 }),
    slug: fc.stringMatching(/^[a-z0-9-]{1,20}$/),
    icon: fc.constantFrom('smartphone', 'laptop', 'headphones', 'tv', 'camera', 'tag'),
    description: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 100 })),
    spec_template: fc.constant({ fields: [] }),
    display_order: fc.integer({ min: 0, max: 100 }),
    created_at: fc.constant('2024-01-01T00:00:00Z'),
  })

export const arbitraryBestOfListItem = (): fc.Arbitrary<BestOfListItem> =>
  fc.record({
    id: fc.uuid(),
    list_id: fc.uuid(),
    product_id: fc.uuid(),
    product: arbitraryProductSummary(),
    rank: fc.integer({ min: 1, max: 20 }),
    pick_reason: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 200 })),
  })
