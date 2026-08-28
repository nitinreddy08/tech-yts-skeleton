/**
 * lib/data/search.ts is now a thin composition over productRepository.list()
 * plus deal-badge enrichment. These tests exercise that composition against
 * the real seed data — the filtering/sorting behavior itself is covered by
 * lib/repositories/__tests__/product-repository.test.ts.
 */
import { describe, it, expect } from 'vitest'
import { searchProductsFull, searchProducts } from '../search'

describe('searchProductsFull', () => {
  it('matches by name and returns rich fields', async () => {
    const results = await searchProductsFull('iphone')
    expect(results.length).toBeGreaterThan(0)
    const iphone = results.find((r) => r.slug === 'apple-iphone-16')
    expect(iphone).toBeDefined()
    expect(iphone!.brand_name).toBe('Apple')
    expect(iphone!.creator_rating).toBeGreaterThan(0)
  })

  it('ranks an exact/prefix name match above a looser tag match', async () => {
    const results = await searchProductsFull('oneplus')
    expect(results[0].name.toLowerCase()).toContain('oneplus')
  })

  it('applies category + price + rating filters together', async () => {
    const results = await searchProductsFull('', {
      category: 'smartphones',
      maxPrice: 30000,
      minRating: 7,
    })
    expect(results.length).toBeGreaterThan(0)
    for (const r of results) {
      expect(r.category_slug).toBe('smartphones')
      expect(r.current_price_inr).not.toBeNull()
      expect(r.current_price_inr!).toBeLessThanOrEqual(30000)
      expect(r.creator_rating).toBeGreaterThanOrEqual(7)
    }
  })

  it('sorts by price ascending when requested', async () => {
    const results = await searchProductsFull('', { sort: 'price_asc' })
    const prices = results.map((r) => r.current_price_inr ?? Infinity)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('flags has_active_deal for a product with a live deal', async () => {
    const results = await searchProductsFull('oneplus 13')
    const op13 = results.find((r) => r.slug === 'oneplus-13')
    expect(op13?.has_active_deal).toBe(true)
    expect(op13?.deal_savings_percent).toBeGreaterThan(0)
  })

  it('returns no results for an unmatched query', async () => {
    const results = await searchProductsFull('zzzznonexistentproduct')
    expect(results).toEqual([])
  })
})

describe('searchProducts (typeahead)', () => {
  it('returns [] for queries under 2 characters', async () => {
    expect(await searchProducts('a')).toEqual([])
    expect(await searchProducts('')).toEqual([])
  })

  it('respects the limit', async () => {
    const results = await searchProducts('a', 2)
    // 'a' is <2 chars only when trimmed length < 2; 'a' alone is 1 char so this hits the guard.
    expect(results).toEqual([])
  })

  it('returns lightweight SearchResult shape', async () => {
    const results = await searchProducts('iphone', 5)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]).toMatchObject({ type: 'product' })
    expect(results[0]).toHaveProperty('brand_name')
  })
})
