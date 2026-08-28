import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryBrandRepository } from '../in-memory/brand-repository'
import { makeStore, type TestStore } from './fixtures'

let store: TestStore
let repo: ReturnType<typeof createInMemoryBrandRepository>

beforeEach(() => {
  store = makeStore()
  repo = createInMemoryBrandRepository(store as unknown as Parameters<typeof createInMemoryBrandRepository>[0])
})

describe('BrandRepository', () => {
  it('lists brands sorted alphabetically', async () => {
    const list = await repo.list()
    const names = list.map((b) => b.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('listWithCounts excludes brands with zero published products', async () => {
    const withCounts = await repo.listWithCounts()
    expect(withCounts.every((b) => b.productCount > 0)).toBe(true)
    // seed data has no published products for Bose
    expect(withCounts.some((b) => b.slug === 'bose')).toBe(false)
  })

  it('listWithCounts is sorted by count desc, then name', async () => {
    const withCounts = await repo.listWithCounts()
    const counts = withCounts.map((b) => b.productCount)
    expect(counts).toEqual([...counts].sort((a, b) => b - a))
  })

  it('excludes unpublished products from the count', async () => {
    store.products.find((p) => p.brand_id === 'brand-samsung')!.is_published = false
    const withCounts = await repo.listWithCounts()
    const samsung = withCounts.find((b) => b.slug === 'samsung')
    expect(samsung).toBeUndefined()
  })

  it('findBySlug / findById resolve the right brand', async () => {
    expect((await repo.findBySlug('apple'))?.id).toBe('brand-apple')
    expect((await repo.findById('brand-apple'))?.slug).toBe('apple')
  })

  it('productsForBrand returns published products sorted by rating desc', async () => {
    const products = await repo.productsForBrand('apple')
    expect(products.length).toBeGreaterThan(0)
    expect(products.every((p) => p.brand_name === 'Apple')).toBe(true)
    const ratings = products.map((p) => p.creator_rating)
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a))
  })

  it('productsForBrand returns [] for an unknown brand slug', async () => {
    expect(await repo.productsForBrand('nope')).toEqual([])
  })
})
