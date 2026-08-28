import { describe, it, expect } from 'vitest'
import { getFrequentComparesForProduct } from '../frequent-compares'

describe('getFrequentComparesForProduct', () => {
  it('includes a curated pair when the product is part of one', async () => {
    const pairs = await getFrequentComparesForProduct('oneplus-13')
    expect(pairs.some((p) => p.slugs.includes('oneplus-13'))).toBe(true)
  })

  it('fills remaining slots with same-category products', async () => {
    const pairs = await getFrequentComparesForProduct('samsung-galaxy-s25', 5)
    expect(pairs.length).toBeGreaterThan(0)
    expect(pairs.length).toBeLessThanOrEqual(5)
  })

  it('respects the limit', async () => {
    const pairs = await getFrequentComparesForProduct('samsung-galaxy-s25', 1)
    expect(pairs.length).toBeLessThanOrEqual(1)
  })

  it('returns [] for an unknown product slug with no category to fall back on', async () => {
    expect(await getFrequentComparesForProduct('nonexistent-product-slug')).toEqual([])
  })
})
