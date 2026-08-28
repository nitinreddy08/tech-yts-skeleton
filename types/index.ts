/**
 * types/index.ts
 *
 * Public type surface for the app. Domain entity types are **derived from the
 * Zod schemas** in `@/lib/schemas` (the single source of truth) and re-exported
 * here so the hundreds of existing `import { X } from '@/types'` call sites keep
 * working unchanged. Types that don't yet have a schema (view-model and
 * client-only shapes) are still declared inline below and will migrate as their
 * feature is re-engineered.
 */

// ─── Schema-derived domain types (source of truth: lib/schemas) ──────────────
export type {
  SpecFieldType,
  SpecField,
  SpecTemplate,
  Category,
  Brand,
  StockStatus,
  AffiliateLink,
  FAQ,
  ProductBenchmarks,
  ProductSummary,
  ProductDetail,
  ProductCreate,
  ProductUpdate,
  AffiliateLinkInput,
  FaqInput,
  DealType,
  Deal,
  DealInput,
  DealUpdate,
} from '@/lib/schemas'

import type { ProductSummary, ProductDetail, AffiliateLink, FAQ } from '@/lib/schemas'

// ─── BestOfList (schema migration pending — Cycle 3) ─────────────────────────
export interface BestOfListItem {
  id: string
  list_id: string
  product_id: string
  product: ProductSummary
  rank: number
  pick_reason: string | null
}

export interface BestOfList {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url: string | null
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
  items: BestOfListItem[]
}

// ─── ClickLog (schema migration pending — Cycle 3) ───────────────────────────
export interface ClickLog {
  id: string
  affiliate_link_id: string
  product_id: string
  store_name: string
  clicked_at: string
  user_agent: string | null
  referrer: string | null
  ip_hash: string | null
}

// ─── Search (schema migration pending — Cycle 2) ─────────────────────────────
export interface SearchResult {
  id: string
  name: string
  slug: string
  category_slug: string
  thumbnail_url: string
  current_price_inr: number | null
  type: 'product' | 'category' | 'brand'
  brand_name?: string
  creator_rating?: number
}

// ─── Comparison engine (client-only view models) ─────────────────────────────
export interface CompareState {
  productIds: string[]
  products: ProductDetail[]
}

export interface CompareActions {
  addProduct: (id: string) => void
  removeProduct: (id: string) => void
  clearAll: () => void
}

export interface SpecDiffRow {
  specKey: string
  label: string
  values: (string | number | boolean | null)[]
  hasDiff: boolean
}

// ─── Filtering and sorting ───────────────────────────────────────────────────
export type SortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popular'

export interface ProductFilters {
  brands?: string[]
  priceRange?: { min: number; max: number }
  rating?: number
  specs?: Record<string, string | number | boolean>
}

// ─── Admin form ──────────────────────────────────────────────────────────────
export interface ProductFormData {
  name: string
  slug: string
  category_id: string
  brand_id: string
  tagline?: string
  description?: string
  specifications: Record<string, string | number | boolean | null>
  pros: string[]
  cons: string[]
  creator_rating: number
  youtube_video_url?: string
  youtube_short_url?: string
  thumbnail_url: string
  gallery_images: string[]
  launch_price_inr?: number
  current_price_inr?: number
  is_featured: boolean
  is_deal_of_the_day: boolean
  deal_badge_text?: string
  is_published: boolean
  tags: string[]
  affiliate_links: Omit<AffiliateLink, 'id' | 'product_id'>[]
  faqs: Omit<FAQ, 'id' | 'product_id'>[]
}
