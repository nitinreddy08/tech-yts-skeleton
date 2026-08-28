import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryCategoryRepository } from '../in-memory/category-repository'
import { makeStore, type TestStore } from './fixtures'

let store: TestStore
let repo: ReturnType<typeof createInMemoryCategoryRepository>

beforeEach(() => {
  store = makeStore()
  repo = createInMemoryCategoryRepository(store as unknown as Parameters<typeof createInMemoryCategoryRepository>[0])
})

describe('CategoryRepository', () => {
  it('lists categories sorted by display_order', async () => {
    const list = await repo.list()
    const orders = list.map((c) => c.display_order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('findBySlug returns the matching category', async () => {
    const cat = await repo.findBySlug('smartphones')
    expect(cat?.name).toBe('Smartphones')
  })

  it('findBySlug returns null for an unknown slug', async () => {
    expect(await repo.findBySlug('nope')).toBeNull()
  })

  it('findById returns the matching category', async () => {
    const cat = await repo.findById('cat-laptops')
    expect(cat?.slug).toBe('laptops')
  })
})
