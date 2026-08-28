import { describe, it, expect } from 'vitest'
import { getPopularTagsForCategory } from '../category-tags'

describe('getPopularTagsForCategory', () => {
  it('only counts tags from products in that category', async () => {
    const tags = await getPopularTagsForCategory('headphones')
    // 'snapdragon' is a smartphone-only tag in the seed data
    expect(tags.some((t) => t.slug === 'snapdragon')).toBe(false)
  })

  it('respects the limit', async () => {
    const tags = await getPopularTagsForCategory('smartphones', 2)
    expect(tags.length).toBeLessThanOrEqual(2)
  })

  it('returns [] for a category with no published products', async () => {
    expect(await getPopularTagsForCategory('nonexistent-category')).toEqual([])
  })
})
