import { describe, it, expect } from 'vitest'
import { getCheaperAlternatives } from '../alternatives'

describe('getCheaperAlternatives', () => {
  it('returns [] when currentPrice is null', async () => {
    expect(await getCheaperAlternatives('prod-samsung-s25', 'smartphones', null)).toEqual([])
  })

  it('only returns products strictly cheaper than currentPrice, in the same category', async () => {
    const alts = await getCheaperAlternatives('prod-samsung-s25', 'smartphones', 79999)
    expect(alts.length).toBeGreaterThan(0)
    for (const alt of alts) {
      expect(alt.category_slug).toBe('smartphones')
      expect(alt.current_price_inr).not.toBeNull()
      expect(alt.current_price_inr!).toBeLessThan(79999)
    }
  })

  it('excludes the product itself', async () => {
    const alts = await getCheaperAlternatives('prod-samsung-s25', 'smartphones', 999999)
    expect(alts.every((a) => a.id !== 'prod-samsung-s25')).toBe(true)
  })

  it('respects the limit', async () => {
    const alts = await getCheaperAlternatives('prod-samsung-s25', 'smartphones', 999999, 1)
    expect(alts.length).toBeLessThanOrEqual(1)
  })
})
