/**
 * lib/repositories/in-memory/product-repository.ts
 *
 * In-memory implementation of ProductRepository, backed by the mock db. All
 * catalog/category/brand/search query logic lives here exactly once, and both
 * the server data layer and the MSW handlers go through it.
 */
import { db, newId, type db as DbType } from '@/lib/mock/db'
import {
  productCreateSchema,
  productUpdateSchema,
  canPublish,
  type ProductDetail,
  type AffiliateLink,
  type FAQ,
} from '@/lib/schemas'
import { paginate, type Paginated } from '@/lib/schemas/common'
import { parseOrThrow } from '../validate'
import { ConflictError, ForeignKeyError, NotFoundError, ValidationError } from '../errors'
import type {
  ProductRepository,
  ProductQuery,
  ProductSort,
  ProductCreateInput,
  ProductUpdateInput,
} from '../product-repository'
import { assembleProductDetail, toProductSummary, clickCountsByProduct } from './mappers'

type Store = typeof DbType

// ─── Query helpers ────────────────────────────────────────────────────────────

/** Relevance score for free-text search; higher = better match, 0 = no match. */
function relevanceScore(p: ProductDetail, q: string): number {
  const name = p.name.toLowerCase()
  if (name === q) return 100
  if (name.startsWith(q)) return 80
  if (name.includes(q)) return 60
  if (p.slug.includes(q)) return 55
  if (p.tags.some((t) => t.toLowerCase() === q)) return 50
  if (p.brand_name.toLowerCase().includes(q)) return 40
  if (p.tags.some((t) => t.toLowerCase().includes(q))) return 30
  if (p.category.name.toLowerCase().includes(q)) return 20
  return 0
}

function matchesText(p: ProductDetail, q: string): boolean {
  if (q.length < 2) return true
  return relevanceScore(p, q) > 0
}

function matchesSpecs(p: ProductDetail, specs: Record<string, string | number | boolean>): boolean {
  return Object.entries(specs).every(([key, value]) => {
    const actual = p.specifications[key]
    if (actual == null) return false
    return String(actual).toLowerCase() === String(value).toLowerCase()
  })
}

function applySort(
  list: ProductDetail[],
  sort: ProductSort | undefined,
  query: string,
  counts: Record<string, number>
): ProductDetail[] {
  const sorted = [...list]
  switch (sort) {
    case 'price_asc':
      return sorted.sort(
        (a, b) => (a.current_price_inr ?? Infinity) - (b.current_price_inr ?? Infinity)
      )
    case 'price_desc':
      return sorted.sort((a, b) => (b.current_price_inr ?? 0) - (a.current_price_inr ?? 0))
    case 'rating_desc':
      return sorted.sort((a, b) => b.creator_rating - a.creator_rating)
    case 'popular':
      return sorted.sort((a, b) => {
        const d = (counts[b.id] ?? 0) - (counts[a.id] ?? 0)
        return d !== 0 ? d : b.creator_rating - a.creator_rating
      })
    case 'relevance':
      if (query.length >= 2) {
        return sorted.sort((a, b) => {
          const d = relevanceScore(b, query) - relevanceScore(a, query)
          return d !== 0 ? d : b.creator_rating - a.creator_rating
        })
      }
      // fall through to newest when there's no meaningful query
      return sorted.sort(byNewest)
    case 'newest':
    default:
      return sorted.sort(byNewest)
  }
}

function byNewest(a: ProductDetail, b: ProductDetail): number {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
}

// ─── Repository ───────────────────────────────────────────────────────────────

export function createInMemoryProductRepository(store: Store = db): ProductRepository {
  /** Apply a ProductQuery to the store and return matching, sorted detail rows. */
  function query(q: ProductQuery = {}): ProductDetail[] {
    const search = (q.search ?? '').toLowerCase().trim()
    const brandSlugSet = q.brandSlugs?.length ? new Set(q.brandSlugs) : null
    const brandIdSet = q.brandIds?.length ? new Set(q.brandIds) : null
    const tagSet = q.tags?.length ? new Set(q.tags.map((t) => t.toLowerCase())) : null

    let rows = store.products
      .map((row) => assembleProductDetail(store, row))
      .filter((p) => {
        if (q.publishStatus === 'published' && !p.is_published) return false
        else if (q.publishStatus === 'draft' && p.is_published) return false
        else if (!q.publishStatus && !q.includeUnpublished && !p.is_published) return false
        if (q.categorySlug && p.category_slug !== q.categorySlug) return false
        if (brandSlugSet && !brandSlugSet.has(p.brand.slug)) return false
        if (brandIdSet && !brandIdSet.has(p.brand_id)) return false
        if (tagSet && !p.tags.some((t) => tagSet.has(t.toLowerCase()))) return false
        if (q.featured && !p.is_featured) return false
        if (q.minRating != null && p.creator_rating < q.minRating) return false
        if (q.minPrice != null && (p.current_price_inr == null || p.current_price_inr < q.minPrice))
          return false
        if (q.maxPrice != null && (p.current_price_inr == null || p.current_price_inr > q.maxPrice))
          return false
        if (q.specs && !matchesSpecs(p, q.specs)) return false
        if (search && !matchesText(p, search)) return false
        return true
      })

    rows = applySort(rows, q.sort ?? (search ? 'relevance' : 'newest'), search, clickCountsByProduct(store))
    if (q.limit != null) rows = rows.slice(0, q.limit)
    return rows
  }

  function requireRowIndex(id: string): number {
    const idx = store.products.findIndex((p) => p.id === id)
    if (idx === -1) throw new NotFoundError('Product', id)
    return idx
  }

  return {
    async list(q) {
      return query(q).map(toProductSummary)
    },

    async listDetailed(q) {
      return query(q)
    },

    async paginate(q, page, pageSize): Promise<Paginated<ProductDetail>> {
      return paginate(query(q), page, pageSize)
    },

    async findBySlug(slug, opts) {
      const row = store.products.find(
        (p) => p.slug === slug && (opts?.includeUnpublished || p.is_published)
      )
      return row ? assembleProductDetail(store, row) : null
    },

    async findByCategoryAndSlug(categorySlug, slug) {
      const row = store.products.find(
        (p) => p.slug === slug && p.category_slug === categorySlug && p.is_published
      )
      return row ? assembleProductDetail(store, row) : null
    },

    async findById(id, opts) {
      const row = store.products.find(
        (p) => p.id === id && (opts?.includeUnpublished || p.is_published)
      )
      return row ? assembleProductDetail(store, row) : null
    },

    async publishedOptions() {
      return store.products
        .filter((p) => p.is_published)
        .map((p) => ({ id: p.id, name: p.name }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },

    async create(input: ProductCreateInput) {
      const data = parseOrThrow(productCreateSchema, input, 'Invalid product')

      const category = store.categories.find((c) => c.id === data.category_id)
      const brand = store.brands.find((b) => b.id === data.brand_id)
      if (!category) throw new ForeignKeyError(`Unknown category_id: ${data.category_id}`)
      if (!brand) throw new ForeignKeyError(`Unknown brand_id: ${data.brand_id}`)

      if (store.products.some((p) => p.slug === data.slug)) {
        throw new ConflictError(`A product with slug "${data.slug}" already exists`)
      }

      if (data.is_published && !canPublish({ thumbnail_url: data.thumbnail_url, affiliateLinkCount: data.affiliate_links.length })) {
        throw new ValidationError('Cannot publish: a thumbnail and at least one affiliate link are required', {
          is_published: ['Add a thumbnail and at least one affiliate link before publishing'],
        })
      }

      const id = newId()
      const now = new Date().toISOString()

      const affiliate_links: AffiliateLink[] = data.affiliate_links.map((l) => ({
        ...l,
        id: newId(),
        product_id: id,
        last_updated: l.last_updated ?? now,
      }))
      const faqs: FAQ[] = data.faqs.map((f, i) => ({
        ...f,
        id: newId(),
        product_id: id,
        display_order: f.display_order ?? i,
      }))

      const product: ProductDetail = {
        id,
        name: data.name,
        slug: data.slug,
        category_id: category.id,
        category_slug: category.slug,
        brand_id: brand.id,
        brand_name: brand.name,
        tagline: data.tagline,
        description: data.description,
        specifications: data.specifications,
        benchmarks: data.benchmarks,
        pros: data.pros,
        cons: data.cons,
        creator_rating: data.creator_rating,
        youtube_video_url: data.youtube_video_url,
        youtube_short_url: data.youtube_short_url,
        thumbnail_url: data.thumbnail_url,
        gallery_images: data.gallery_images,
        launch_price_inr: data.launch_price_inr,
        current_price_inr: data.current_price_inr,
        is_featured: data.is_featured,
        is_deal_of_the_day: data.is_deal_of_the_day,
        deal_badge_text: data.deal_badge_text,
        is_published: data.is_published,
        tags: data.tags,
        created_at: now,
        updated_at: now,
        affiliate_links,
        faqs,
        category,
        brand,
      }

      store.affiliateLinks.push(...affiliate_links)
      store.faqs.push(...faqs)
      store.products.push(product)
      return assembleProductDetail(store, product)
    },

    async update(id, input: ProductUpdateInput) {
      const idx = requireRowIndex(id)
      const data = parseOrThrow(productUpdateSchema, input, 'Invalid product')
      const existing = store.products[idx]
      const now = new Date().toISOString()

      if (data.slug && data.slug !== existing.slug) {
        if (store.products.some((p) => p.slug === data.slug && p.id !== id)) {
          throw new ConflictError(`A product with slug "${data.slug}" already exists`)
        }
      }

      const category = data.category_id
        ? store.categories.find((c) => c.id === data.category_id) ??
          (() => {
            throw new ForeignKeyError(`Unknown category_id: ${data.category_id}`)
          })()
        : existing.category
      const brand = data.brand_id
        ? store.brands.find((b) => b.id === data.brand_id) ??
          (() => {
            throw new ForeignKeyError(`Unknown brand_id: ${data.brand_id}`)
          })()
        : existing.brand

      // Resolve the state this update would leave the product in *before*
      // mutating anything, so a failed publish invariant leaves no partial write.
      const finalIsPublished = data.is_published ?? existing.is_published
      const finalThumbnail = data.thumbnail_url ?? existing.thumbnail_url
      const finalLinkCount =
        data.affiliate_links !== undefined
          ? data.affiliate_links.length
          : store.affiliateLinks.filter((l) => l.product_id === id).length
      if (finalIsPublished && !canPublish({ thumbnail_url: finalThumbnail, affiliateLinkCount: finalLinkCount })) {
        throw new ValidationError('Cannot publish: a thumbnail and at least one affiliate link are required', {
          is_published: ['Add a thumbnail and at least one affiliate link before publishing'],
        })
      }

      // Replace child collections only when the caller provided them.
      if (data.affiliate_links !== undefined) {
        store.affiliateLinks = store.affiliateLinks.filter((l) => l.product_id !== id)
        store.affiliateLinks.push(
          ...data.affiliate_links.map((l) => ({
            ...l,
            id: newId(),
            product_id: id,
            last_updated: l.last_updated ?? now,
          }))
        )
      }
      if (data.faqs !== undefined) {
        store.faqs = store.faqs.filter((f) => f.product_id !== id)
        store.faqs.push(
          ...data.faqs.map((f, i) => ({
            ...f,
            id: newId(),
            product_id: id,
            display_order: f.display_order ?? i,
          }))
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- discarding already-handled fields
      const { affiliate_links: _a, faqs: _f, category_id: _c, brand_id: _b, ...scalar } = data
      store.products[idx] = {
        ...existing,
        ...scalar,
        category,
        brand,
        category_id: category.id,
        category_slug: category.slug,
        brand_id: brand.id,
        brand_name: brand.name,
        updated_at: now,
      }

      return assembleProductDetail(store, store.products[idx])
    },

    async remove(id) {
      const idx = requireRowIndex(id)
      store.products.splice(idx, 1)
      store.affiliateLinks = store.affiliateLinks.filter((l) => l.product_id !== id)
      store.faqs = store.faqs.filter((f) => f.product_id !== id)
    },

    async togglePublish(id) {
      const idx = requireRowIndex(id)
      const willPublish = !store.products[idx].is_published
      if (willPublish) {
        const linkCount = store.affiliateLinks.filter((l) => l.product_id === id).length
        if (!canPublish({ thumbnail_url: store.products[idx].thumbnail_url, affiliateLinkCount: linkCount })) {
          throw new ValidationError(
            'Cannot publish: a thumbnail and at least one affiliate link are required',
            { is_published: ['Add a thumbnail and at least one affiliate link before publishing'] }
          )
        }
      }
      store.products[idx].is_published = willPublish
      store.products[idx].updated_at = new Date().toISOString()
      return assembleProductDetail(store, store.products[idx])
    },
  }
}
