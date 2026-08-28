import { describe, it, expect, vi } from 'vitest'

// fetchAllTags/fetchProductsByTag are wrapped in next/cache's unstable_cache,
// which throws outside a real Next.js request (no incrementalCache available
// in a unit test). Make it a passthrough so the underlying logic still runs.
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }))

const { fetchAllTags, fetchProductsByTag, tagSlug, tagLabel } = await import('../tags')

describe('tagSlug / tagLabel', () => {
  it('slugifies multi-word tags', () => {
    expect(tagSlug('Fast Charging')).toBe('fast-charging')
  })
  it('round-trips label back to spaces', () => {
    expect(tagLabel('fast-charging')).toBe('fast charging')
  })
})

describe('fetchAllTags', () => {
  it('returns tags sorted by count desc, then label', async () => {
    const tags = await fetchAllTags()
    expect(tags.length).toBeGreaterThan(0)
    for (let i = 1; i < tags.length; i++) {
      expect(tags[i - 1].count).toBeGreaterThanOrEqual(tags[i].count)
    }
  })

  it('includes a known seed tag', async () => {
    const tags = await fetchAllTags()
    expect(tags.some((t) => t.slug === 'flagship')).toBe(true)
  })
})

describe('fetchProductsByTag', () => {
  it('returns matching published products sorted by rating desc', async () => {
    const result = await fetchProductsByTag('flagship')
    expect(result).not.toBeNull()
    expect(result!.products.length).toBeGreaterThan(0)
    const ratings = result!.products.map((p) => p.creator_rating)
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a))
  })

  it('returns null for a tag with no matching products', async () => {
    expect(await fetchProductsByTag('zzz-nonexistent-tag')).toBeNull()
  })
})
