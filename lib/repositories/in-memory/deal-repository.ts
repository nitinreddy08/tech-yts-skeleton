/**
 * lib/repositories/in-memory/deal-repository.ts
 *
 * In-memory DealRepository. Every read enriches the stored row with its derived
 * lifecycle `status` and `savings_percent`, and joins a fresh product summary —
 * the "view" a backend would expose. Queries filter on derived status, so the
 * meaning of "live" is defined once (`dealStatus`) and shared everywhere.
 */
import { db, newId, type db as DbType } from '@/lib/mock/db'
import {
  dealInputSchema,
  dealUpdateSchema,
  dealStatus,
  dealSavingsPercent,
  type Deal,
  type DealStatus,
} from '@/lib/schemas'
import { parseOrThrow } from '../validate'
import { ForeignKeyError, NotFoundError } from '../errors'
import type { DealRepository, DealQuery, DealView, DealInputRaw, DealUpdateRaw } from '../deal-repository'
import { toProductSummary } from './mappers'

type Store = typeof DbType

const HOUR_MS = 3_600_000

export function createInMemoryDealRepository(store: Store = db): DealRepository {
  function toView(deal: Deal, now: Date): DealView {
    const product = store.products.find((p) => p.id === deal.product_id)
    return {
      ...deal,
      product: product ? toProductSummary(product) : undefined,
      status: dealStatus(deal, now),
      savings_percent: dealSavingsPercent(deal),
    }
  }

  function runQuery(q: DealQuery = {}): DealView[] {
    const now = new Date()
    const wantStatuses: DealStatus[] | null = q.liveOnly
      ? ['active']
      : q.status?.length
        ? q.status
        : null
    const expiryCutoff =
      q.expiringWithinHours != null ? now.getTime() + q.expiringWithinHours * HOUR_MS : null

    return store.deals
      .map((d) => toView(d, now))
      .filter((d) => {
        if (wantStatuses && !wantStatuses.includes(d.status)) return false
        // expiringWithinHours implies live + a bounded, non-null expiry window
        if (expiryCutoff != null) {
          if (d.status !== 'active' || !d.expires_at) return false
          if (new Date(d.expires_at).getTime() > expiryCutoff) return false
        }
        if (q.type && d.deal_type !== q.type) return false
        if (q.productId && d.product_id !== q.productId) return false
        return true
      })
      .sort(sortForQuery(q))
  }

  function sortForQuery(q: DealQuery) {
    // Expiring lists sort by soonest expiry; everything else by newest.
    if (q.expiringWithinHours != null) {
      return (a: DealView, b: DealView) =>
        new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime()
    }
    return (a: DealView, b: DealView) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  }

  function requireProduct(productId: string) {
    if (!store.products.some((p) => p.id === productId)) {
      throw new ForeignKeyError(`Unknown product_id: ${productId}`)
    }
  }

  function requireIndex(id: string): number {
    const idx = store.deals.findIndex((d) => d.id === id)
    if (idx === -1) throw new NotFoundError('Deal', id)
    return idx
  }

  return {
    async list(q) {
      return runQuery(q)
    },

    async findById(id) {
      const deal = store.deals.find((d) => d.id === id)
      return deal ? toView(deal, new Date()) : null
    },

    async dealOfTheDay() {
      return runQuery({ liveOnly: true, type: 'deal_of_day' })[0] ?? null
    },

    async forProduct(productId) {
      return runQuery({ liveOnly: true, productId })
    },

    async create(input: DealInputRaw) {
      const data = parseOrThrow(dealInputSchema, input, 'Invalid deal')
      requireProduct(data.product_id)
      const deal: Deal = {
        id: newId(),
        product_id: data.product_id,
        deal_type: data.deal_type,
        headline: data.headline,
        original_price_inr: data.original_price_inr,
        deal_price_inr: data.deal_price_inr,
        store_name: data.store_name,
        affiliate_url: data.affiliate_url,
        starts_at: data.starts_at,
        expires_at: data.expires_at,
        is_active: data.is_active,
        created_at: new Date().toISOString(),
      }
      store.deals.push(deal)
      return toView(deal, new Date())
    },

    async update(id, input: DealUpdateRaw) {
      const idx = requireIndex(id)
      const data = parseOrThrow(dealUpdateSchema, input, 'Invalid deal')
      if (data.product_id) requireProduct(data.product_id)
      store.deals[idx] = { ...store.deals[idx], ...data }
      return toView(store.deals[idx], new Date())
    },

    async remove(id) {
      const idx = requireIndex(id)
      store.deals.splice(idx, 1)
    },

    async toggleActive(id) {
      const idx = requireIndex(id)
      store.deals[idx].is_active = !store.deals[idx].is_active
      return toView(store.deals[idx], new Date())
    },
  }
}
