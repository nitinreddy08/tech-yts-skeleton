import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryBestOfListRepository } from '../in-memory/best-of-list-repository'
import { ConflictError, ForeignKeyError, NotFoundError } from '../errors'
import { makeStore, type TestStore } from './fixtures'

let store: TestStore
let repo: ReturnType<typeof createInMemoryBestOfListRepository>

beforeEach(() => {
  store = makeStore()
  repo = createInMemoryBestOfListRepository(store as unknown as Parameters<typeof createInMemoryBestOfListRepository>[0])
})

describe('BestOfListRepository — queries', () => {
  it('list returns published lists sorted by display_order by default', async () => {
    const lists = await repo.list()
    expect(lists.length).toBeGreaterThan(0)
    expect(lists.every((l) => l.is_published)).toBe(true)
    const orders = lists.map((l) => l.display_order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('includes drafts when publishedOnly is false', async () => {
    store.bestOfLists[0].is_published = false
    const lists = await repo.list({ publishedOnly: false })
    expect(lists.some((l) => l.id === store.bestOfLists[0].id)).toBe(true)
  })

  it('re-joins each item with the current product summary', async () => {
    const list = await repo.findBySlug('best-smartphones-2026')
    expect(list).not.toBeNull()
    for (const item of list!.items) {
      expect(item.product.id).toBe(item.product_id)
    }
  })

  it('items are sorted by rank', async () => {
    const list = await repo.findBySlug('best-smartphones-2026')
    const ranks = list!.items.map((i) => i.rank)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })

  it('drops an item whose product was deleted, instead of crashing', async () => {
    const list = store.bestOfLists.find((l) => l.slug === 'best-smartphones-2026')!
    const deadItemProductId = list.items[0].product_id
    store.products = store.products.filter((p) => p.id !== deadItemProductId)

    const result = await repo.findBySlug('best-smartphones-2026')
    expect(result!.items.every((i) => i.product_id !== deadItemProductId)).toBe(true)
  })

  it('findBySlug excludes unpublished by default', async () => {
    store.bestOfLists[0].is_published = false
    expect(await repo.findBySlug(store.bestOfLists[0].slug)).toBeNull()
    expect(await repo.findBySlug(store.bestOfLists[0].slug, { includeUnpublished: true })).not.toBeNull()
  })
})

describe('BestOfListRepository — mutations', () => {
  const validInput = {
    title: 'Best Budget Phones',
    slug: 'best-budget-phones',
    items: [{ product_id: 'prod-redmi-note-14', rank: 1, pick_reason: 'Great value' }],
  }

  it('creates a list and resolves item products', async () => {
    const created = await repo.create(validInput)
    expect(created.items).toHaveLength(1)
    expect(created.items[0].product.name).toBe('Redmi Note 14 Pro')
  })

  it('rejects a duplicate slug', async () => {
    await expect(repo.create({ ...validInput, slug: 'best-smartphones-2026' })).rejects.toBeInstanceOf(
      ConflictError
    )
  })

  it('rejects an item referencing a nonexistent product', async () => {
    await expect(
      repo.create({ ...validInput, items: [{ product_id: 'prod-nope', rank: 1, pick_reason: null }] })
    ).rejects.toBeInstanceOf(ForeignKeyError)
  })

  it('update replaces items only when provided', async () => {
    const list = await repo.findBySlug('best-smartphones-2026')
    const updated = await repo.update(list!.id, { title: 'Renamed' })
    expect(updated.title).toBe('Renamed')
    expect(updated.items).toHaveLength(list!.items.length)
  })

  it('replaceItems swaps the item set', async () => {
    const list = await repo.findBySlug('best-smartphones-2026')
    const updated = await repo.replaceItems(list!.id, [
      { product_id: 'prod-macbook-air-m3', rank: 1, pick_reason: 'New pick' },
    ])
    expect(updated.items).toHaveLength(1)
    expect(updated.items[0].product_id).toBe('prod-macbook-air-m3')
  })

  it('remove throws NotFoundError for unknown id', async () => {
    await expect(repo.remove('bol-nope')).rejects.toBeInstanceOf(NotFoundError)
  })
})
