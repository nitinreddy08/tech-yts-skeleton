import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryDealRepository } from '../in-memory/deal-repository'
import { ForeignKeyError, NotFoundError, ValidationError } from '../errors'
import { dealStatus, dealSavingsPercent } from '@/lib/schemas'
import { makeStore, type TestStore } from './fixtures'

let store: TestStore
let repo: ReturnType<typeof createInMemoryDealRepository>

beforeEach(() => {
  store = makeStore()
  repo = createInMemoryDealRepository(store as unknown as Parameters<typeof createInMemoryDealRepository>[0])
})

const iso = (offsetHours: number) => new Date(Date.now() + offsetHours * 3600_000).toISOString()

describe('dealStatus derivation', () => {
  it('inactive when is_active is false', () => {
    expect(dealStatus({ is_active: false, starts_at: null, expires_at: null })).toBe('inactive')
  })
  it('scheduled when starts_at is in the future', () => {
    expect(dealStatus({ is_active: true, starts_at: iso(24), expires_at: iso(48) })).toBe('scheduled')
  })
  it('expired when expires_at is in the past', () => {
    expect(dealStatus({ is_active: true, starts_at: iso(-48), expires_at: iso(-1) })).toBe('expired')
  })
  it('active within its window', () => {
    expect(dealStatus({ is_active: true, starts_at: iso(-1), expires_at: iso(1) })).toBe('active')
  })
})

describe('dealSavingsPercent', () => {
  it('rounds the percentage', () => {
    expect(dealSavingsPercent({ original_price_inr: 1000, deal_price_inr: 750 })).toBe(25)
  })
  it('is null when the discount is impossible', () => {
    expect(dealSavingsPercent({ original_price_inr: 1000, deal_price_inr: 1000 })).toBeNull()
    expect(dealSavingsPercent({ original_price_inr: null, deal_price_inr: 500 })).toBeNull()
  })
})

describe('DealRepository — queries', () => {
  it('list enriches each row with status + savings + product summary', async () => {
    const all = await repo.list()
    expect(all.length).toBeGreaterThan(0)
    for (const d of all) {
      expect(['active', 'scheduled', 'expired', 'inactive']).toContain(d.status)
      expect(d.product?.id).toBe(d.product_id)
    }
  })

  it('liveOnly returns only active deals', async () => {
    const live = await repo.list({ liveOnly: true })
    expect(live.every((d) => d.status === 'active')).toBe(true)
  })

  it('excludes an expired deal from liveOnly', async () => {
    store.deals[0].expires_at = iso(-1)
    const live = await repo.list({ liveOnly: true })
    expect(live.some((d) => d.id === store.deals[0].id)).toBe(false)
  })

  it('dealOfTheDay returns a live deal_of_day', async () => {
    const dotd = await repo.dealOfTheDay()
    expect(dotd?.deal_type).toBe('deal_of_day')
    expect(dotd?.status).toBe('active')
  })

  it('forProduct returns live deals for a product, soonest not required', async () => {
    const dotd = await repo.dealOfTheDay()
    const forProd = await repo.forProduct(dotd!.product_id)
    expect(forProd.every((d) => d.product_id === dotd!.product_id && d.status === 'active')).toBe(true)
  })

  it('expiringWithinHours filters + sorts by soonest expiry', async () => {
    store.deals[0].expires_at = iso(10)
    store.deals[1].expires_at = iso(2)
    const soon = await repo.list({ expiringWithinHours: 48 })
    const times = soon.map((d) => new Date(d.expires_at!).getTime())
    expect(times).toEqual([...times].sort((a, b) => a - b))
  })
})

describe('DealRepository — mutations', () => {
  const input = {
    product_id: 'prod-samsung-s25',
    deal_type: 'price_drop' as const,
    headline: 'Test drop',
    original_price_inr: 80000,
    deal_price_inr: 70000,
    store_name: 'Amazon',
    affiliate_url: 'https://amazon.in/dp/x',
  }

  it('creates a deal and computes savings', async () => {
    const created = await repo.create(input)
    expect(created.savings_percent).toBe(13)
    expect(created.product?.id).toBe('prod-samsung-s25')
  })

  it('rejects an unknown product_id', async () => {
    await expect(repo.create({ ...input, product_id: 'prod-nope' })).rejects.toBeInstanceOf(
      ForeignKeyError
    )
  })

  it('rejects deal_price >= original_price with ValidationError', async () => {
    await expect(repo.create({ ...input, deal_price_inr: 90000 })).rejects.toBeInstanceOf(
      ValidationError
    )
  })

  it('toggleActive flips is_active and recomputes status', async () => {
    const dotd = await repo.dealOfTheDay()
    const toggled = await repo.toggleActive(dotd!.id)
    expect(toggled.is_active).toBe(false)
    expect(toggled.status).toBe('inactive')
  })

  it('remove throws NotFoundError for unknown id', async () => {
    await expect(repo.remove('deal-nope')).rejects.toBeInstanceOf(NotFoundError)
  })
})
