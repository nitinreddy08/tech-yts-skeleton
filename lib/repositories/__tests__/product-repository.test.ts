import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryProductRepository } from '../in-memory/product-repository'
import { ConflictError, ForeignKeyError, NotFoundError, ValidationError } from '../errors'
import { makeStore, type TestStore } from './fixtures'

let store: TestStore
let repo: ReturnType<typeof createInMemoryProductRepository>

beforeEach(() => {
  store = makeStore()
  // in-memory repo accepts any store with the db shape
  repo = createInMemoryProductRepository(store as unknown as Parameters<typeof createInMemoryProductRepository>[0])
})

describe('ProductRepository — queries', () => {
  it('lists only published products by default', async () => {
    store.products[0].is_published = false
    const list = await repo.list()
    expect(list.every((p) => p.id !== store.products[0].id)).toBe(true)
  })

  it('includes unpublished when asked', async () => {
    store.products[0].is_published = false
    const list = await repo.list({ includeUnpublished: true })
    expect(list.some((p) => p.id === store.products[0].id)).toBe(true)
  })

  it('filters by category slug', async () => {
    const list = await repo.list({ categorySlug: 'smartphones' })
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((p) => p.category_slug === 'smartphones')).toBe(true)
  })

  it('filters by brand slug and price range together (AND semantics)', async () => {
    const list = await repo.list({ brandSlugs: ['apple'], maxPrice: 100000 })
    expect(list.every((p) => p.brand_name === 'Apple')).toBe(true)
    expect(list.every((p) => (p.current_price_inr ?? 0) <= 100000)).toBe(true)
  })

  it('filters by minimum rating', async () => {
    const list = await repo.list({ minRating: 9 })
    expect(list.every((p) => p.creator_rating >= 9)).toBe(true)
  })

  it('filters by exact spec match', async () => {
    const list = await repo.listDetailed({ specs: { '5g': true } })
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((p) => String(p.specifications['5g']).toLowerCase() === 'true')).toBe(true)
  })

  it('does not mutate inputs and returns a fresh array (no shared reference)', async () => {
    const a = await repo.list()
    const b = await repo.list()
    expect(a).not.toBe(b)
  })

  it('sorts by price ascending', async () => {
    const list = await repo.list({ sort: 'price_asc' })
    const prices = list.map((p) => p.current_price_inr ?? Infinity)
    expect(prices).toEqual([...prices].sort((x, y) => x - y))
  })

  it('ranks exact-name search matches first (relevance)', async () => {
    const list = await repo.list({ search: 'iPhone' })
    expect(list[0].name.toLowerCase()).toContain('iphone')
  })

  it('paginates detail rows with a correct total count', async () => {
    const total = (await repo.listDetailed({ includeUnpublished: true })).length
    const page1 = await repo.paginate({ includeUnpublished: true }, 1, 3)
    expect(page1.data).toHaveLength(3)
    expect(page1.count).toBe(total)
    expect(page1.page).toBe(1)
  })

  it('sorts affiliate links by price ascending on detail', async () => {
    const p = await repo.findBySlug('samsung-galaxy-s25')
    const prices = p!.affiliate_links.map((l) => l.price_inr ?? Infinity)
    expect(prices).toEqual([...prices].sort((x, y) => x - y))
  })
})

describe('ProductRepository — finders', () => {
  it('findBySlug returns null for an unpublished product', async () => {
    store.products[0].is_published = false
    expect(await repo.findBySlug(store.products[0].slug)).toBeNull()
  })

  it('findByCategoryAndSlug enforces the category', async () => {
    expect(await repo.findByCategoryAndSlug('laptops', 'samsung-galaxy-s25')).toBeNull()
    expect(await repo.findByCategoryAndSlug('smartphones', 'samsung-galaxy-s25')).not.toBeNull()
  })

  it('publishedOptions returns sorted {id,name}', async () => {
    const opts = await repo.publishedOptions()
    const names = opts.map((o) => o.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
})

describe('ProductRepository — mutations', () => {
  const validInput = {
    name: 'Test Phone',
    slug: 'test-phone',
    category_id: 'cat-smartphones',
    brand_id: 'brand-samsung',
    creator_rating: 7,
    affiliate_links: [
      { store_name: 'Amazon', affiliate_url: 'https://amazon.in/dp/test', price_inr: 19999 },
    ],
  }

  it('creates a product, applies defaults, and joins links', async () => {
    const created = await repo.create(validInput)
    expect(created.slug).toBe('test-phone')
    expect(created.is_published).toBe(false) // default
    expect(created.affiliate_links).toHaveLength(1)
    expect(created.affiliate_links[0].product_id).toBe(created.id)
    expect(await repo.findById(created.id, { includeUnpublished: true })).not.toBeNull()
  })

  it('rejects a duplicate slug with ConflictError', async () => {
    await expect(repo.create({ ...validInput, slug: 'samsung-galaxy-s25' })).rejects.toBeInstanceOf(
      ConflictError
    )
  })

  it('rejects an unknown category_id with ForeignKeyError', async () => {
    await expect(repo.create({ ...validInput, category_id: 'cat-nope' })).rejects.toBeInstanceOf(
      ForeignKeyError
    )
  })

  it('rejects invalid input with ValidationError carrying field errors', async () => {
    await expect(repo.create({ ...validInput, slug: 'Not A Slug' })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
    try {
      await repo.create({ ...validInput, slug: 'Not A Slug' })
    } catch (e) {
      expect(e).toBeInstanceOf(ValidationError)
      expect((e as ValidationError).fieldErrors).toHaveProperty('slug')
    }
  })

  it('updates scalar fields without touching child collections', async () => {
    const before = await repo.findBySlug('samsung-galaxy-s25')
    const updated = await repo.update(before!.id, { creator_rating: 9.9 })
    expect(updated.creator_rating).toBe(9.9)
    expect(updated.affiliate_links).toHaveLength(before!.affiliate_links.length)
  })

  it('replaces affiliate links when provided', async () => {
    const before = await repo.findBySlug('samsung-galaxy-s25')
    const updated = await repo.update(before!.id, {
      affiliate_links: [
        { store_name: 'Croma', affiliate_url: 'https://croma.com/x', price_inr: 71000 },
      ],
    })
    expect(updated.affiliate_links).toHaveLength(1)
    expect(updated.affiliate_links[0].store_name).toBe('Croma')
  })

  it('rejects an update slug clash with ConflictError', async () => {
    const s25 = await repo.findBySlug('samsung-galaxy-s25')
    await expect(repo.update(s25!.id, { slug: 'apple-iphone-16' })).rejects.toBeInstanceOf(
      ConflictError
    )
  })

  it('removes a product and cascades its links + faqs', async () => {
    const p = await repo.findBySlug('samsung-galaxy-s25')
    await repo.remove(p!.id)
    expect(await repo.findById(p!.id, { includeUnpublished: true })).toBeNull()
    expect(store.affiliateLinks.some((l) => l.product_id === p!.id)).toBe(false)
    expect(store.faqs.some((f) => f.product_id === p!.id)).toBe(false)
  })

  it('remove throws NotFoundError for an unknown id', async () => {
    await expect(repo.remove('prod-nope')).rejects.toBeInstanceOf(NotFoundError)
  })

  it('togglePublish flips the flag', async () => {
    const p = await repo.findBySlug('samsung-galaxy-s25')
    const toggled = await repo.togglePublish(p!.id)
    expect(toggled.is_published).toBe(false)
  })
})

describe('ProductRepository — publish invariant (thumbnail + affiliate link required)', () => {
  const validInput = {
    name: 'Test Phone',
    slug: 'test-phone',
    category_id: 'cat-smartphones',
    brand_id: 'brand-samsung',
    creator_rating: 7,
  }

  it('rejects create with is_published: true and no thumbnail/links', async () => {
    await expect(repo.create({ ...validInput, is_published: true })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
  })

  it('allows create with is_published: true when thumbnail + link are present', async () => {
    const created = await repo.create({
      ...validInput,
      is_published: true,
      thumbnail_url: 'https://example.com/x.jpg',
      affiliate_links: [{ store_name: 'Amazon', affiliate_url: 'https://amazon.in/dp/x' }],
    })
    expect(created.is_published).toBe(true)
  })

  it('rejects update that sets is_published: true on a product with no thumbnail', async () => {
    const created = await repo.create(validInput) // unpublished, no thumbnail
    await expect(repo.update(created.id, { is_published: true })).rejects.toMatchObject({
      code: 'VALIDATION',
    })
  })

  it('rejects update that clears the last affiliate link while staying published', async () => {
    const s25 = await repo.findBySlug('samsung-galaxy-s25')
    await expect(
      repo.update(s25!.id, { affiliate_links: [] })
    ).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('rejects togglePublish from unpublished when thumbnail/links are missing', async () => {
    const created = await repo.create(validInput)
    await expect(repo.togglePublish(created.id)).rejects.toMatchObject({ code: 'VALIDATION' })
  })

  it('allows togglePublish to unpublish regardless of thumbnail/links', async () => {
    const s25 = await repo.findBySlug('samsung-galaxy-s25')
    const toggled = await repo.togglePublish(s25!.id)
    expect(toggled.is_published).toBe(false)
  })
})
