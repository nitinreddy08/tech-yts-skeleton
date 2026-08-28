/**
 * lib/schemas/product.ts
 *
 * Zod schemas for the product aggregate and everything it composes
 * (categories, brands, affiliate links, FAQs). These are the single source of
 * truth: the TypeScript types in `@/types` are re-exported from the `z.infer`
 * outputs below, and the repository layer validates every write against the
 * `*Input` schemas before it touches the store.
 *
 * Read models (`productSummarySchema`, `productDetailSchema`) describe the
 * *assembled* shape the UI consumes. The normalised "table row" that a real
 * database would store is `productRowSchema` — the repository is responsible
 * for joining rows into read models, exactly as a SQL query would.
 */
import { z } from 'zod'
import { idSchema, slugSchema, isoDateSchema, priceInrSchema, ratingSchema } from './common'

// ─── Spec templates ─────────────────────────────────────────────────────────

export const specFieldTypeSchema = z.enum([
  'text',
  'number',
  'select',
  'boolean',
  'multiselect',
])

export const specFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: specFieldTypeSchema,
  unit: z.string().optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  group: z.string().optional(),
})

export const specTemplateSchema = z.object({
  fields: z.array(specFieldSchema),
})

// ─── Category & Brand ───────────────────────────────────────────────────────

export const categorySchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  slug: slugSchema,
  icon: z.string(),
  description: z.string().nullable(),
  spec_template: specTemplateSchema,
  display_order: z.number().int(),
  created_at: isoDateSchema,
})

export const brandSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  slug: slugSchema,
  logo_url: z.string().nullable(),
})

// ─── Affiliate links & FAQs ─────────────────────────────────────────────────

export const stockStatusSchema = z.enum(['in_stock', 'low_stock', 'out_of_stock'])

export const affiliateLinkSchema = z.object({
  id: idSchema,
  product_id: idSchema,
  store_name: z.string().min(1),
  store_icon: z.string().nullable(),
  affiliate_url: z.string().url(),
  price_inr: priceInrSchema,
  is_best_price: z.boolean(),
  last_updated: isoDateSchema,
  stock_status: stockStatusSchema.optional(),
})

export const faqSchema = z.object({
  id: idSchema,
  product_id: idSchema,
  question: z.string().min(1),
  answer: z.string().min(1),
  display_order: z.number().int(),
})

// ─── Product read models ────────────────────────────────────────────────────

/** A single specification value. `null` means "known not-applicable". */
export const specValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
export const specificationsSchema: z.ZodType<Record<string, z.infer<typeof specValueSchema>>> =
  z.record(z.string(), specValueSchema)

export const productBenchmarksSchema = z.object({
  antutu: z.number().optional(),
  geekbench_single: z.number().optional(),
  geekbench_multi: z.number().optional(),
})

/** Fields shared by the card/list view and the full detail view. */
const productSummaryShape = {
  id: idSchema,
  name: z.string().min(1),
  slug: slugSchema,
  category_id: idSchema,
  category_slug: slugSchema,
  brand_id: idSchema,
  brand_name: z.string(),
  thumbnail_url: z.string(),
  creator_rating: ratingSchema,
  current_price_inr: priceInrSchema,
  launch_price_inr: priceInrSchema,
  is_featured: z.boolean(),
  is_deal_of_the_day: z.boolean(),
  deal_badge_text: z.string().nullable(),
  tags: z.array(z.string()),
  youtube_video_url: z.string().nullable(),
  created_at: isoDateSchema,
}

export const productSummarySchema = z.object(productSummaryShape)

export const productDetailSchema = z.object({
  ...productSummaryShape,
  tagline: z.string().nullable(),
  description: z.string().nullable(),
  specifications: specificationsSchema,
  benchmarks: productBenchmarksSchema.optional(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  youtube_short_url: z.string().nullable(),
  gallery_images: z.array(z.string()),
  is_published: z.boolean(),
  updated_at: isoDateSchema,
  affiliate_links: z.array(affiliateLinkSchema),
  faqs: z.array(faqSchema),
  category: categorySchema,
  brand: brandSchema,
})

// ─── Write DTOs (validated at the repository boundary) ──────────────────────

export const affiliateLinkInputSchema = z.object({
  store_name: z.string().min(1),
  store_icon: z.string().nullable().default(null),
  affiliate_url: z.string().url(),
  price_inr: priceInrSchema.default(null),
  is_best_price: z.boolean().default(false),
  last_updated: isoDateSchema.optional(),
  stock_status: stockStatusSchema.optional(),
})

export const faqInputSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  display_order: z.number().int().default(0),
})

/**
 * Everything needed to create a product. `category_id`/`brand_id` are foreign
 * keys the repository resolves (and rejects if they don't exist), rather than
 * trusting the caller to send a denormalised `category`/`brand` blob.
 */
export const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: slugSchema,
  category_id: idSchema,
  brand_id: idSchema,
  tagline: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  specifications: specificationsSchema.default({}),
  benchmarks: productBenchmarksSchema.optional(),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  creator_rating: ratingSchema.default(0),
  youtube_video_url: z.string().nullable().default(null),
  youtube_short_url: z.string().nullable().default(null),
  thumbnail_url: z.string().default(''),
  gallery_images: z.array(z.string()).default([]),
  launch_price_inr: priceInrSchema.default(null),
  current_price_inr: priceInrSchema.default(null),
  is_featured: z.boolean().default(false),
  is_deal_of_the_day: z.boolean().default(false),
  deal_badge_text: z.string().nullable().default(null),
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  affiliate_links: z.array(affiliateLinkInputSchema).default([]),
  faqs: z.array(faqInputSchema).default([]),
})

/**
 * Partial update — every field optional and still validated if present.
 *
 * NOTE: this is intentionally not `productCreateSchema.partial()`. Every field
 * on the create schema carries a `.default(...)` so Zod fills it in even when
 * absent from the input; `.partial()` only relaxes *required-ness*, it does not
 * suppress those defaults. That would make an omitted `affiliate_links` parse
 * as `[]` instead of `undefined`, and the repository's "only replace child
 * collections when the caller provided them" logic depends on telling those
 * two cases apart. So each field below is declared bare-optional instead.
 */
export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: slugSchema.optional(),
  category_id: idSchema.optional(),
  brand_id: idSchema.optional(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  specifications: specificationsSchema.optional(),
  benchmarks: productBenchmarksSchema.optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  creator_rating: ratingSchema.optional(),
  youtube_video_url: z.string().nullable().optional(),
  youtube_short_url: z.string().nullable().optional(),
  thumbnail_url: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  launch_price_inr: priceInrSchema.optional(),
  current_price_inr: priceInrSchema.optional(),
  is_featured: z.boolean().optional(),
  is_deal_of_the_day: z.boolean().optional(),
  deal_badge_text: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  affiliate_links: z.array(affiliateLinkInputSchema).optional(),
  faqs: z.array(faqInputSchema).optional(),
})

// ─── Inferred types (the single source of truth for `@/types`) ──────────────

export type SpecFieldType = z.infer<typeof specFieldTypeSchema>
export type SpecField = z.infer<typeof specFieldSchema>
export type SpecTemplate = z.infer<typeof specTemplateSchema>
export type Category = z.infer<typeof categorySchema>
export type Brand = z.infer<typeof brandSchema>
export type StockStatus = z.infer<typeof stockStatusSchema>
export type AffiliateLink = z.infer<typeof affiliateLinkSchema>
export type FAQ = z.infer<typeof faqSchema>
export type ProductBenchmarks = z.infer<typeof productBenchmarksSchema>
export type ProductSummary = z.infer<typeof productSummarySchema>
export type ProductDetail = z.infer<typeof productDetailSchema>
export type AffiliateLinkInput = z.infer<typeof affiliateLinkInputSchema>
export type FaqInput = z.infer<typeof faqInputSchema>
export type ProductCreate = z.infer<typeof productCreateSchema>
export type ProductUpdate = z.infer<typeof productUpdateSchema>
