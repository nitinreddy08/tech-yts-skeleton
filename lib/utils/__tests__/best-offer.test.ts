import { describe, it, expect } from 'vitest'
import { getBestOffer } from '../best-offer'

const link = (id: string, price: number | null, stock?: 'in_stock' | 'low_stock' | 'out_of_stock') => ({
  id,
  price_inr: price,
  stock_status: stock,
})

describe('getBestOffer', () => {
  it('picks the cheapest priced link', () => {
    const r = getBestOffer([link('a', 100), link('b', 80)])
    expect(r.link?.id).toBe('b')
    expect(r.price).toBe(80)
    expect(r.allUnavailable).toBe(false)
  })

  it('skips out-of-stock links even when they are cheaper', () => {
    const r = getBestOffer([link('a', 100), link('b', 80, 'out_of_stock')])
    expect(r.link?.id).toBe('a')
    expect(r.available.map((l) => l.id)).toEqual(['a'])
  })

  it('treats low stock as purchasable and missing status as in stock', () => {
    expect(getBestOffer([link('a', 90, 'low_stock'), link('b', 95)]).link?.id).toBe('a')
  })

  it('reports allUnavailable and no best link when every store is out of stock', () => {
    const r = getBestOffer([link('a', 100, 'out_of_stock'), link('b', 80, 'out_of_stock')])
    expect(r.link).toBeNull()
    expect(r.price).toBeNull()
    expect(r.allUnavailable).toBe(true)
  })

  it('ignores unpriced links when choosing the best price', () => {
    const r = getBestOffer([link('a', null), link('b', 120)])
    expect(r.link?.id).toBe('b')
  })

  it('handles an empty list', () => {
    const r = getBestOffer([])
    expect(r.link).toBeNull()
    expect(r.allUnavailable).toBe(false)
  })
})
