/**
 * Guards that the seed data actually conforms to the schemas that are supposed
 * to be its source of truth. If someone adds a malformed product or deal to the
 * mock db, this fails loudly instead of silently shipping bad data — the same
 * safety a real database's constraints would give.
 */
import { describe, it, expect } from 'vitest'
import {
  categorySchema,
  brandSchema,
  productDetailSchema,
  dealSchema,
  affiliateLinkSchema,
  faqSchema,
  bestOfListSchema,
  clickLogSchema,
  newsletterSubscriberSchema,
} from '@/lib/schemas'
import {
  categories,
  brands,
  products,
  deals,
  affiliateLinks,
  faqs,
  bestOfLists,
  clickLogs,
  newsletterSubscribers,
} from '@/lib/mock/db'

describe('seed data conforms to schemas', () => {
  it.each(categories.map((c) => [c.slug, c] as const))('category %s', (_slug, c) => {
    expect(categorySchema.safeParse(c).success).toBe(true)
  })

  it.each(brands.map((b) => [b.slug, b] as const))('brand %s', (_slug, b) => {
    expect(brandSchema.safeParse(b).success).toBe(true)
  })

  it.each(products.map((p) => [p.slug, p] as const))('product %s', (_slug, p) => {
    const res = productDetailSchema.safeParse(p)
    if (!res.success) console.error(res.error.flatten())
    expect(res.success).toBe(true)
  })

  it.each(affiliateLinks.map((l) => [l.id, l] as const))('affiliate link %s', (_id, l) => {
    expect(affiliateLinkSchema.safeParse(l).success).toBe(true)
  })

  it.each(faqs.map((f) => [f.id, f] as const))('faq %s', (_id, f) => {
    expect(faqSchema.safeParse(f).success).toBe(true)
  })

  it.each(deals.map((d) => [d.id, d] as const))('deal %s', (_id, d) => {
    const res = dealSchema.safeParse(d)
    if (!res.success) console.error(res.error.flatten())
    expect(res.success).toBe(true)
  })

  it.each(bestOfLists.map((l) => [l.slug, l] as const))('best-of list %s', (_slug, l) => {
    const res = bestOfListSchema.safeParse(l)
    if (!res.success) console.error(res.error.flatten())
    expect(res.success).toBe(true)
  })

  it.each(clickLogs.map((c) => [c.id, c] as const))('click log %s', (_id, c) => {
    expect(clickLogSchema.safeParse(c).success).toBe(true)
  })

  it.each(newsletterSubscribers.map((s) => [s.email, s] as const))(
    'newsletter subscriber %s',
    (_email, s) => {
      expect(newsletterSubscriberSchema.safeParse(s).success).toBe(true)
    }
  )
})
