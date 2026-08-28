/**
 * lib/repositories/deal-repository.ts
 *
 * The deal repository interface. Note that queries filter by *derived* status
 * (`active`/`scheduled`/`expired`/`inactive`) rather than the stored
 * `is_active` boolean — the impl evaluates `dealStatus()` per row so the public
 * site and admin agree on what "live" means, and the same predicate ports to a
 * SQL `WHERE` clause.
 */
import type { Deal, DealInput, DealUpdate, DealType, DealStatus } from '@/lib/schemas'
import type { z } from 'zod'
import type { dealInputSchema, dealUpdateSchema } from '@/lib/schemas/deal'

export type DealInputRaw = z.input<typeof dealInputSchema>
export type DealUpdateRaw = z.input<typeof dealUpdateSchema>

/** Enriched read model: the stored deal plus its server-computed extras. */
export interface DealView extends Deal {
  status: DealStatus
  savings_percent: number | null
}

export interface DealQuery {
  /** Keep only deals whose derived status is one of these (default: all). */
  status?: DealStatus[]
  /** Convenience for `status: ['active']`. */
  liveOnly?: boolean
  type?: DealType
  productId?: string
  /** Deals expiring within this many hours (implies liveOnly). */
  expiringWithinHours?: number
}

export interface DealRepository {
  /** Deals matching the query, newest first, each enriched with status + savings. */
  list(query?: DealQuery): Promise<DealView[]>
  findById(id: string): Promise<DealView | null>
  /** The single live "deal of the day", or null. */
  dealOfTheDay(): Promise<DealView | null>
  /** All live deals for a product (used on product pages). */
  forProduct(productId: string): Promise<DealView[]>

  create(input: DealInputRaw | DealInput): Promise<DealView>
  update(id: string, input: DealUpdateRaw | DealUpdate): Promise<DealView>
  remove(id: string): Promise<void>
  toggleActive(id: string): Promise<DealView>
}
