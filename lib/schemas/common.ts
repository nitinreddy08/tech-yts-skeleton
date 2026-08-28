/**
 * lib/schemas/common.ts
 *
 * Shared Zod primitives and API envelope shapes used across every domain
 * schema and repository. Keeping these in one place means the whole app
 * validates ids, slugs, prices, and timestamps the same way — and the day we
 * swap MSW for a real backend, the wire contract is already pinned down here.
 */
import { z } from 'zod'

/** Opaque identifier. Mock ids look like `prod-…`; a real DB would use UUIDs. */
export const idSchema = z.string().min(1)

/** URL-safe slug: lowercase alphanumerics separated by single hyphens. */
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase, hyphen-separated slug')

/** ISO-8601 timestamp string (what every `*_at` column serializes to). */
export const isoDateSchema = z.iso.datetime({ offset: true })

/** A price in Indian paise-free rupees. Non-negative integer or null (TBD). */
export const priceInrSchema = z.number().int().nonnegative().nullable()

/** Creator rating on a 0.0–10.0 scale. */
export const ratingSchema = z.number().min(0).max(10)

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})
export type PaginationParams = z.infer<typeof paginationParamsSchema>

/** Standard paginated envelope. `count` mirrors the shape the admin UI expects. */
export interface Paginated<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

/**
 * Wrap an already-filtered list into a page. Centralised so every repository
 * paginates identically (and a real backend can push this into SQL LIMIT/OFFSET).
 */
export function paginate<T>(items: T[], page: number, pageSize: number): Paginated<T> {
  const from = (page - 1) * pageSize
  return {
    data: items.slice(from, from + pageSize),
    count: items.length,
    page,
    pageSize,
  }
}
