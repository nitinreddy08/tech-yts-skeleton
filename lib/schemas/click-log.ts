/**
 * lib/schemas/click-log.ts
 *
 * Schema for the append-only affiliate ClickLog (Requirement 4). Deliberately
 * has no `update`/`delete` — a click record is a fact, never edited after
 * the fact, matching Requirement 4.3's "GDPR-safe analytics" intent (hashed
 * IP, immutable trail).
 */
import { z } from 'zod'
import { idSchema, isoDateSchema } from './common'

export const clickLogSchema = z.object({
  id: idSchema,
  affiliate_link_id: z.string().min(1),
  product_id: idSchema,
  store_name: z.string().min(1),
  clicked_at: isoDateSchema,
  user_agent: z.string().nullable(),
  referrer: z.string().nullable(),
  ip_hash: z.string().nullable(),
})

/** What the redirect handler has in hand before an id/timestamp are assigned. */
export const clickLogInputSchema = z.object({
  affiliate_link_id: z.string().min(1),
  product_id: idSchema,
  store_name: z.string().min(1),
  user_agent: z.string().nullable().default(null),
  referrer: z.string().nullable().default(null),
  ip_hash: z.string().nullable().default(null),
})

export type ClickLog = z.infer<typeof clickLogSchema>
export type ClickLogInput = z.infer<typeof clickLogInputSchema>
