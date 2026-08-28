/**
 * lib/repositories/product-repository.ts
 *
 * The product repository *interface* — the seam between the app and its data
 * source. Every server data function and MSW handler talks to this interface,
 * never to the store directly. Today it's backed by the in-memory mock db; to
 * move to Supabase/REST/Prisma you implement this one interface and rebind it
 * in `lib/repositories/index.ts`. Nothing else changes.
 *
 * All methods are async on purpose: the in-memory impl resolves immediately,
 * but the signatures already match a networked backend so callers never have to
 * be rewritten from sync to async later.
 */
import type { ProductSummary, ProductDetail } from '@/lib/schemas'
import type { z } from 'zod'
import type { productCreateSchema, productUpdateSchema } from '@/lib/schemas/product'
import type { Paginated } from '@/lib/schemas/common'

/** Pre-parse input types (defaults optional), what callers actually pass. */
export type ProductCreateInput = z.input<typeof productCreateSchema>
export type ProductUpdateInput = z.input<typeof productUpdateSchema>

export type ProductSort =
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc'
  | 'newest'
  | 'popular'
  | 'relevance'

/**
 * Declarative query — the union of every filter the catalog, category, brand,
 * and search features need. A real backend translates this into one SQL query;
 * the in-memory impl applies it as a filter chain.
 */
export interface ProductQuery {
  /** Free-text search across name, tags, brand, and category. */
  search?: string
  categorySlug?: string
  brandSlugs?: string[]
  brandIds?: string[]
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  minRating?: number
  /** Exact-match spec key/value pairs (Requirement 3.5). */
  specs?: Record<string, string | number | boolean>
  featured?: boolean
  /** Include unpublished rows (admin only). Defaults to false. */
  includeUnpublished?: boolean
  /**
   * Admin tri-state filter: 'published' or 'draft' narrows to exactly that
   * state (overriding `includeUnpublished`); omitted means "no publish-state
   * filter" — combine with `includeUnpublished` to decide whether drafts show
   * up at all.
   */
  publishStatus?: 'published' | 'draft'
  sort?: ProductSort
  /** Cap the number of rows (applied after sort, before pagination). */
  limit?: number
}

export interface ProductRepository {
  /** Filtered/sorted summaries for cards and lists. */
  list(query?: ProductQuery): Promise<ProductSummary[]>

  /** Same query, but returns full detail rows (search/compare/category facets). */
  listDetailed(query?: ProductQuery): Promise<ProductDetail[]>

  /** Paginated detail rows for admin tables. */
  paginate(
    query: ProductQuery,
    page: number,
    pageSize: number
  ): Promise<Paginated<ProductDetail>>

  findBySlug(slug: string, opts?: { includeUnpublished?: boolean }): Promise<ProductDetail | null>
  findByCategoryAndSlug(categorySlug: string, slug: string): Promise<ProductDetail | null>
  findById(id: string, opts?: { includeUnpublished?: boolean }): Promise<ProductDetail | null>

  /** `{id, name}` options for admin dropdowns. */
  publishedOptions(): Promise<{ id: string; name: string }[]>

  /**
   * Accepts `unknown` deliberately: this is the validation boundary. Callers
   * may pass a typed `ProductCreateInput`/`ProductCreate` for convenience, but
   * raw JSON from an HTTP body is just as welcome — `parseOrThrow` is what
   * actually decides whether it's valid, not the TypeScript type checker.
   */
  create(input: unknown): Promise<ProductDetail>
  update(id: string, input: unknown): Promise<ProductDetail>
  remove(id: string): Promise<void>
  togglePublish(id: string): Promise<ProductDetail>
}
