import { describe, it, expect, beforeEach } from 'vitest'
import { createInMemoryClickLogRepository } from '../in-memory/click-log-repository'
import { ValidationError } from '../errors'
import { makeStore, type TestStore } from './fixtures'

let store: TestStore
let repo: ReturnType<typeof createInMemoryClickLogRepository>

beforeEach(() => {
  store = makeStore()
  repo = createInMemoryClickLogRepository(store as unknown as Parameters<typeof createInMemoryClickLogRepository>[0])
})

describe('ClickLogRepository — record', () => {
  const validEntry = {
    affiliate_link_id: 'al-s25-amazon',
    product_id: 'prod-samsung-s25',
    store_name: 'Amazon',
    user_agent: 'Mozilla/5.0',
    referrer: 'https://google.com',
    ip_hash: 'abc123',
  }

  it('assigns an id and clicked_at, and appends to the store', async () => {
    const before = store.clickLogs.length
    const log = await repo.record(validEntry)
    expect(log.id).toBeTruthy()
    expect(log.clicked_at).toBeTruthy()
    expect(log.product_id).toBe('prod-samsung-s25')
    expect(store.clickLogs).toHaveLength(before + 1)
  })

  it('defaults optional fields to null when omitted', async () => {
    const log = await repo.record({
      affiliate_link_id: 'al-s25-amazon',
      product_id: 'prod-samsung-s25',
      store_name: 'Amazon',
    })
    expect(log.user_agent).toBeNull()
    expect(log.referrer).toBeNull()
    expect(log.ip_hash).toBeNull()
  })

  it('rejects a missing store_name', async () => {
    await expect(repo.record({ ...validEntry, store_name: '' })).rejects.toBeInstanceOf(
      ValidationError
    )
  })
})

describe('ClickLogRepository — list', () => {
  it('sorts newest first', async () => {
    const list = await repo.list()
    const times = list.map((l) => new Date(l.clicked_at).getTime())
    expect(times).toEqual([...times].sort((a, b) => b - a))
  })

  it('filters by productId', async () => {
    const list = await repo.list({ productId: 'prod-samsung-s25' })
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((l) => l.product_id === 'prod-samsung-s25')).toBe(true)
  })

  it('filters by since', async () => {
    const cutoff = new Date('2026-08-23T00:00:00Z')
    const list = await repo.list({ since: cutoff })
    expect(list.every((l) => new Date(l.clicked_at) >= cutoff)).toBe(true)
  })
})

describe('ClickLogRepository — countsByProduct', () => {
  it('counts clicks per product', async () => {
    const counts = await repo.countsByProduct()
    expect(counts['prod-samsung-s25']).toBe(3)
  })

  it('reflects newly recorded clicks', async () => {
    await repo.record({
      affiliate_link_id: 'al-rn14-flipkart',
      product_id: 'prod-redmi-note-14',
      store_name: 'Flipkart',
    })
    const counts = await repo.countsByProduct()
    expect(counts['prod-redmi-note-14']).toBe(1)
  })
})
