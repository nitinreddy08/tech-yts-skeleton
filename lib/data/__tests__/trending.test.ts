import { describe, it, expect, vi } from 'vitest'

// fetchTrendingProducts is wrapped in next/cache's unstable_cache, which
// throws outside a real Next.js request — see tags.test.ts for the same fix.
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }))

const { fetchTrendingProducts, getProductClickCounts } = await import('../trending')

describe('getProductClickCounts', () => {
  it('counts clicks per product from the seed click log', () => {
    const counts = getProductClickCounts()
    expect(counts['prod-samsung-s25']).toBe(3)
  })
})

describe('fetchTrendingProducts', () => {
  it('ranks clicked products first, most-clicked first', async () => {
    const trending = await fetchTrendingProducts(2)
    expect(trending[0].id).toBe('prod-samsung-s25') // 3 clicks in seed data, the most of any product
  })

  it('fills remaining slots with top-rated unclicked products when fewer than limit were clicked', async () => {
    const trending = await fetchTrendingProducts(20)
    // seed data has 5 distinct clicked products; the rest must come from the rating fallback
    const clickedIds = new Set(['prod-samsung-s25', 'prod-iphone-16', 'prod-oneplus-13', 'prod-sony-wh1000xm6', 'prod-macbook-air-m3'])
    const fallbackEntries = trending.filter((p) => !clickedIds.has(p.id))
    expect(fallbackEntries.length).toBeGreaterThan(0)
  })

  it('never returns duplicates and respects the limit', async () => {
    const trending = await fetchTrendingProducts(5)
    expect(trending).toHaveLength(5)
    expect(new Set(trending.map((p) => p.id)).size).toBe(5)
  })
})
