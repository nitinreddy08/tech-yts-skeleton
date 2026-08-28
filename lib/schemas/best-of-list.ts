/**
 * lib/schemas/best-of-list.ts
 *
 * Schemas for the curated Best-Of List aggregate (Requirement 11). Like
 * products, an item's `product` field is a denormalised summary the
 * repository re-joins on every read rather than trusting whatever was cached
 * on the row — the alternative (five copies of the same product→summary
 * mapper scattered through actions/handlers, several using `as any` to paper
 * over a stale shape) is exactly what this schema/repository pair replaces.
 */
import { z } from 'zod'
import { idSchema, slugSchema, isoDateSchema } from './common'
import { productSummarySchema } from './product'

export const bestOfListItemSchema = z.object({
  id: idSchema,
  list_id: idSchema,
  product_id: idSchema,
  product: productSummarySchema,
  rank: z.number().int(),
  pick_reason: z.string().nullable(),
})

export const bestOfListSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  slug: slugSchema,
  description: z.string(),
  cover_image_url: z.string().nullable(),
  is_published: z.boolean(),
  display_order: z.number().int(),
  created_at: isoDateSchema,
  updated_at: isoDateSchema,
  items: z.array(bestOfListItemSchema),
})

// ─── Write DTOs ───────────────────────────────────────────────────────────────

export const bestOfListItemInputSchema = z.object({
  product_id: idSchema,
  rank: z.number().int(),
  pick_reason: z.string().nullable().default(null),
})

export const bestOfListCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: slugSchema,
  description: z.string().default(''),
  cover_image_url: z.string().nullable().default(null),
  is_published: z.boolean().default(false),
  display_order: z.number().int().default(0),
  items: z.array(bestOfListItemInputSchema).default([]),
})

export const bestOfListUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  cover_image_url: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  display_order: z.number().int().optional(),
  items: z.array(bestOfListItemInputSchema).optional(),
})

export type BestOfListItem = z.infer<typeof bestOfListItemSchema>
export type BestOfList = z.infer<typeof bestOfListSchema>
export type BestOfListItemInput = z.infer<typeof bestOfListItemInputSchema>
export type BestOfListCreate = z.infer<typeof bestOfListCreateSchema>
export type BestOfListUpdate = z.infer<typeof bestOfListUpdateSchema>
