/**
 * lib/mock/handlers.ts
 *
 * MSW request handlers.  These intercept fetch() calls made from browser-side
 * code (DynamicSpecForm, SearchBar, etc.) and return data from the mock db.
 *
 * NOTE: Server Components, Server Actions, and Route Handlers import
 * lib/mock/db.ts directly — they don't go through these handlers.
 */

import { http, HttpResponse } from 'msw'
import {
  db,
  newId,
  findProductBySlug,
  searchDb,
  syncProductRelations,
} from './db'
import type { ProductDetail, Deal } from '@/types'

const BASE = '/api/mock'

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoryHandlers = [
  // GET /api/mock/categories
  http.get(`${BASE}/categories`, () => {
    return HttpResponse.json(db.categories)
  }),

  // GET /api/mock/categories/:slug
  http.get(`${BASE}/categories/:slug`, ({ params }) => {
    const cat = db.categories.find(c => c.slug === params.slug)
    if (!cat) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(cat)
  }),

  // GET /api/mock/categories/by-id/:id
  http.get(`${BASE}/categories/by-id/:id`, ({ params }) => {
    const cat = db.categories.find(c => c.id === params.id)
    if (!cat) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(cat)
  }),
]

// ─── Brands ───────────────────────────────────────────────────────────────────

export const brandHandlers = [
  // GET /api/mock/brands
  http.get(`${BASE}/brands`, () => {
    return HttpResponse.json([...db.brands].sort((a, b) => a.name.localeCompare(b.name)))
  }),
]

// ─── Products ─────────────────────────────────────────────────────────────────

export const productHandlers = [
  // GET /api/mock/products — all published products (summary shape)
  http.get(`${BASE}/products`, ({ request }) => {
    const url = new URL(request.url)
    const categorySlug = url.searchParams.get('category')
    const featured = url.searchParams.get('featured')
    const limit = Number(url.searchParams.get('limit') ?? '100')
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20')

    let list = db.products.filter(p => p.is_published)

    if (categorySlug) list = list.filter(p => p.category_slug === categorySlug)
    if (featured === 'true') list = list.filter(p => p.is_featured)

    list = [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    const total = list.length

    // If paginated
    if (url.searchParams.has('page')) {
      const from = (page - 1) * pageSize
      list = list.slice(from, from + pageSize)
      return HttpResponse.json({ data: list, count: total })
    }

    list = list.slice(0, limit)
    return HttpResponse.json(list)
  }),

  // GET /api/mock/products/all — admin: all products regardless of is_published
  http.get(`${BASE}/products/all`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20')

    const sorted = [...db.products].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const total = sorted.length
    const from = (page - 1) * pageSize
    const data = sorted.slice(from, from + pageSize)

    return HttpResponse.json({ data, count: total })
  }),

  // GET /api/mock/products/published-list — simple {id, name} list for dropdowns
  http.get(`${BASE}/products/published-list`, () => {
    const list = db.products
      .filter(p => p.is_published)
      .map(p => ({ id: p.id, name: p.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
    return HttpResponse.json(list)
  }),

  // GET /api/mock/products/by-slug/:slug
  http.get(`${BASE}/products/by-slug/:slug`, ({ params }) => {
    const product = findProductBySlug(params.slug as string)
    if (!product) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(product)
  }),

  // GET /api/mock/products/by-id/:id  — admin, no is_published filter
  http.get(`${BASE}/products/by-id/:id`, ({ params }) => {
    const product = db.products.find(p => p.id === params.id)
    if (!product) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(product)
  }),

  // POST /api/mock/products — create
  http.post(`${BASE}/products`, async ({ request }) => {
    const body = (await request.json()) as Partial<ProductDetail>
    const id = newId()
    const now = new Date().toISOString()
    const category = db.categories.find(c => c.id === body.category_id)
    const brand = db.brands.find(b => b.id === body.brand_id)

    if (!category || !brand) {
      return HttpResponse.json({ error: 'Invalid category_id or brand_id' }, { status: 400 })
    }

    const existing = db.products.find(p => p.slug === body.slug)
    if (existing) {
      return HttpResponse.json({ error: 'Slug already exists', code: '23505' }, { status: 409 })
    }

    const product: ProductDetail = {
      id,
      name: body.name ?? '',
      slug: body.slug ?? '',
      category_id: category.id,
      category_slug: category.slug,
      brand_id: brand.id,
      brand_name: brand.name,
      tagline: body.tagline ?? null,
      description: body.description ?? null,
      specifications: body.specifications ?? {},
      pros: body.pros ?? [],
      cons: body.cons ?? [],
      creator_rating: body.creator_rating ?? 0,
      youtube_video_url: body.youtube_video_url ?? null,
      youtube_short_url: body.youtube_short_url ?? null,
      thumbnail_url: body.thumbnail_url ?? '',
      gallery_images: body.gallery_images ?? [],
      launch_price_inr: body.launch_price_inr ?? null,
      current_price_inr: body.current_price_inr ?? null,
      is_featured: body.is_featured ?? false,
      is_deal_of_the_day: body.is_deal_of_the_day ?? false,
      deal_badge_text: body.deal_badge_text ?? null,
      is_published: body.is_published ?? false,
      tags: body.tags ?? [],
      created_at: now,
      updated_at: now,
      affiliate_links: [],
      faqs: [],
      category,
      brand,
    }

    // Insert affiliate links and faqs if provided
    if (body.affiliate_links?.length) {
      for (const l of body.affiliate_links as any[]) {
        const link = { ...l, id: newId(), product_id: id, last_updated: now }
        db.affiliateLinks.push(link)
      }
    }
    if (body.faqs?.length) {
      for (const [i, f] of (body.faqs as any[]).entries()) {
        db.faqs.push({ ...f, id: newId(), product_id: id, display_order: f.display_order ?? i })
      }
    }
    syncProductRelations(id)
    db.products.push(product)

    return HttpResponse.json(product, { status: 201 })
  }),

  // PATCH /api/mock/products/:id — update
  http.patch(`${BASE}/products/:id`, async ({ params, request }) => {
    const idx = db.products.findIndex(p => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })

    const body = (await request.json()) as Partial<ProductDetail>
    const now = new Date().toISOString()

    // Slug uniqueness check
    if (body.slug && body.slug !== db.products[idx].slug) {
      const clash = db.products.find(p => p.slug === body.slug && p.id !== params.id)
      if (clash) {
        return HttpResponse.json({ error: 'Slug already exists', code: '23505' }, { status: 409 })
      }
    }

    const category = body.category_id
      ? db.categories.find(c => c.id === body.category_id)
      : db.products[idx].category
    const brand = body.brand_id
      ? db.brands.find(b => b.id === body.brand_id)
      : db.products[idx].brand

    db.products[idx] = {
      ...db.products[idx],
      ...body,
      category: category ?? db.products[idx].category,
      brand: brand ?? db.products[idx].brand,
      category_slug: (category ?? db.products[idx].category).slug,
      brand_name: (brand ?? db.products[idx].brand).name,
      updated_at: now,
    }

    // Replace affiliate links
    if (body.affiliate_links !== undefined) {
      db.affiliateLinks = db.affiliateLinks.filter(l => l.product_id !== params.id)
      for (const l of body.affiliate_links as any[]) {
        db.affiliateLinks.push({ ...l, id: newId(), product_id: params.id as string, last_updated: now })
      }
    }

    // Replace faqs
    if (body.faqs !== undefined) {
      db.faqs = db.faqs.filter(f => f.product_id !== params.id)
      for (const [i, f] of (body.faqs as any[]).entries()) {
        db.faqs.push({ ...f, id: newId(), product_id: params.id as string, display_order: f.display_order ?? i })
      }
    }

    syncProductRelations(params.id as string)
    return HttpResponse.json(db.products[idx])
  }),

  // DELETE /api/mock/products/:id
  http.delete(`${BASE}/products/:id`, ({ params }) => {
    const idx = db.products.findIndex(p => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    db.products.splice(idx, 1)
    db.affiliateLinks = db.affiliateLinks.filter(l => l.product_id !== params.id)
    db.faqs = db.faqs.filter(f => f.product_id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH /api/mock/products/:id/toggle-publish
  http.patch(`${BASE}/products/:id/toggle-publish`, ({ params }) => {
    const product = db.products.find(p => p.id === params.id)
    if (!product) return new HttpResponse(null, { status: 404 })
    product.is_published = !product.is_published
    product.updated_at = new Date().toISOString()
    return HttpResponse.json(product)
  }),
]

// ─── Search ───────────────────────────────────────────────────────────────────

export const searchHandlers = [
  http.get('/api/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const limit = Number(url.searchParams.get('limit') ?? '10')
    const results = searchDb(q, limit).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category_slug: p.category_slug,
      thumbnail_url: p.thumbnail_url,
      current_price_inr: p.current_price_inr,
      type: 'product' as const,
    }))
    return HttpResponse.json(results)
  }),
]

// ─── Deals ────────────────────────────────────────────────────────────────────

export const dealHandlers = [
  // GET /api/mock/deals
  http.get(`${BASE}/deals`, ({ request }) => {
    const url = new URL(request.url)
    const activeOnly = url.searchParams.get('active') === 'true'
    const type = url.searchParams.get('type')

    const now = new Date()
    let list = [...db.deals]

    if (activeOnly) {
      list = list.filter(
        d =>
          d.is_active &&
          (d.expires_at == null || new Date(d.expires_at) > now)
      )
    }
    if (type) {
      list = list.filter(d => d.deal_type === type)
    }

    list = list.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return HttpResponse.json(list)
  }),

  // GET /api/mock/deals/:id
  http.get(`${BASE}/deals/:id`, ({ params }) => {
    const deal = db.deals.find(d => d.id === params.id)
    if (!deal) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(deal)
  }),

  // POST /api/mock/deals
  http.post(`${BASE}/deals`, async ({ request }) => {
    const body = (await request.json()) as any
    const id = newId()
    const product = db.products.find(p => p.id === body.product_id)
    const deal: Deal = {
      id,
      product_id: body.product_id,
      deal_type: body.deal_type,
      headline: body.headline,
      original_price_inr: body.original_price_inr ?? null,
      deal_price_inr: body.deal_price_inr ?? null,
      store_name: body.store_name,
      affiliate_url: body.affiliate_url,
      starts_at: body.starts_at ?? null,
      expires_at: body.expires_at ?? null,
      is_active: body.is_active ?? true,
      created_at: new Date().toISOString(),
      product: product ? productSummaryFromDetail(product) : undefined,
    }
    db.deals.push(deal)
    return HttpResponse.json(deal, { status: 201 })
  }),

  // PATCH /api/mock/deals/:id
  http.patch(`${BASE}/deals/:id`, async ({ params, request }) => {
    const idx = db.deals.findIndex(d => d.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as any
    db.deals[idx] = { ...db.deals[idx], ...body }
    return HttpResponse.json(db.deals[idx])
  }),

  // DELETE /api/mock/deals/:id
  http.delete(`${BASE}/deals/:id`, ({ params }) => {
    const idx = db.deals.findIndex(d => d.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    db.deals.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH /api/mock/deals/:id/toggle-active
  http.patch(`${BASE}/deals/:id/toggle-active`, ({ params }) => {
    const deal = db.deals.find(d => d.id === params.id)
    if (!deal) return new HttpResponse(null, { status: 404 })
    deal.is_active = !deal.is_active
    return HttpResponse.json(deal)
  }),
]

// ─── Best-Of Lists ────────────────────────────────────────────────────────────

export const bestOfListHandlers = [
  // GET /api/mock/best-of-lists
  http.get(`${BASE}/best-of-lists`, ({ request }) => {
    const url = new URL(request.url)
    const publishedOnly = url.searchParams.get('published') !== 'false'
    let list = [...db.bestOfLists]
    if (publishedOnly) list = list.filter(l => l.is_published)
    list.sort((a, b) => a.display_order - b.display_order)
    return HttpResponse.json(list)
  }),

  // GET /api/mock/best-of-lists/by-slug/:slug
  http.get(`${BASE}/best-of-lists/by-slug/:slug`, ({ params }) => {
    const list = db.bestOfLists.find(l => l.slug === params.slug && l.is_published)
    if (!list) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(list)
  }),

  // GET /api/mock/best-of-lists/:id
  http.get(`${BASE}/best-of-lists/:id`, ({ params }) => {
    const list = db.bestOfLists.find(l => l.id === params.id)
    if (!list) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(list)
  }),

  // POST /api/mock/best-of-lists
  http.post(`${BASE}/best-of-lists`, async ({ request }) => {
    const body = (await request.json()) as any
    const id = newId()
    const now = new Date().toISOString()

    const existing = db.bestOfLists.find(l => l.slug === body.slug)
    if (existing) {
      return HttpResponse.json({ error: 'Slug already exists', code: '23505' }, { status: 409 })
    }

    const list = {
      id,
      title: body.title,
      slug: body.slug,
      description: body.description ?? '',
      cover_image_url: body.cover_image_url ?? null,
      is_published: body.is_published ?? false,
      display_order: body.display_order ?? 0,
      created_at: now,
      updated_at: now,
      items: (body.items ?? []).map((item: any, i: number) => ({
        ...item,
        id: newId(),
        list_id: id,
        product: db.products.find(p => p.id === item.product_id)
          ? productSummaryFromDetail(db.products.find(p => p.id === item.product_id)!)
          : null,
      })),
    }
    db.bestOfLists.push(list)
    return HttpResponse.json(list, { status: 201 })
  }),

  // PATCH /api/mock/best-of-lists/:id
  http.patch(`${BASE}/best-of-lists/:id`, async ({ params, request }) => {
    const idx = db.bestOfLists.findIndex(l => l.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as any
    const now = new Date().toISOString()

    // Slug clash check
    if (body.slug && body.slug !== db.bestOfLists[idx].slug) {
      const clash = db.bestOfLists.find(l => l.slug === body.slug && l.id !== params.id)
      if (clash) {
        return HttpResponse.json({ error: 'Slug already exists', code: '23505' }, { status: 409 })
      }
    }

    db.bestOfLists[idx] = {
      ...db.bestOfLists[idx],
      ...body,
      updated_at: now,
      items: body.items
        ? (body.items as any[]).map(item => ({
            ...item,
            id: item.id ?? newId(),
            list_id: params.id as string,
            product: db.products.find(p => p.id === item.product_id)
              ? productSummaryFromDetail(db.products.find(p => p.id === item.product_id)!)
              : item.product ?? null,
          }))
        : db.bestOfLists[idx].items,
    }

    return HttpResponse.json(db.bestOfLists[idx])
  }),

  // DELETE /api/mock/best-of-lists/:id
  http.delete(`${BASE}/best-of-lists/:id`, ({ params }) => {
    const idx = db.bestOfLists.findIndex(l => l.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    db.bestOfLists.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]

// ─── Affiliate redirect ───────────────────────────────────────────────────────

export const affiliateHandlers = [
  // GET /api/mock/affiliate-links/:id
  http.get(`${BASE}/affiliate-links/:id`, ({ params }) => {
    const link = db.affiliateLinks.find(l => l.id === params.id)
    if (!link) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(link)
  }),

  // POST /api/mock/click-logs
  http.post(`${BASE}/click-logs`, async ({ request }) => {
    const body = (await request.json()) as any
    const log = { ...body, id: newId() }
    db.clickLogs.push(log)
    return HttpResponse.json(log, { status: 201 })
  }),
]

// ─── Stats ────────────────────────────────────────────────────────────────────

export const statsHandlers = [
  http.get(`${BASE}/stats`, () => {
    return HttpResponse.json({
      total_products: db.products.length,
      total_clicks: db.clickLogs.length,
    })
  }),
]

// ─── Auth (mock) ──────────────────────────────────────────────────────────────

export const authHandlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    // Accept any credentials where email contains "admin" or password === "admin"
    if (body.email?.includes('admin') || body.password === 'admin') {
      return HttpResponse.json({ ok: true, user: { email: body.email } })
    }
    return HttpResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 })
  }),
]

// ─── Image upload (mock) ──────────────────────────────────────────────────────

export const storageHandlers = [
  // POST /api/mock/storage/upload — returns a fake public URL
  http.post(`${BASE}/storage/upload`, async () => {
    const fakeUrl = `https://placehold.co/400x400/6366f1/ffffff?text=Image`
    return HttpResponse.json({ url: fakeUrl })
  }),
]

// ─── All handlers combined ────────────────────────────────────────────────────

export const handlers = [
  ...categoryHandlers,
  ...brandHandlers,
  ...productHandlers,
  ...searchHandlers,
  ...dealHandlers,
  ...bestOfListHandlers,
  ...affiliateHandlers,
  ...statsHandlers,
  ...authHandlers,
  ...storageHandlers,
]

// Helper also used in deal handlers
function productSummaryFromDetail(p: ProductDetail) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    category_slug: p.category_slug,
    brand_id: p.brand_id,
    brand_name: p.brand_name,
    thumbnail_url: p.thumbnail_url,
    creator_rating: p.creator_rating,
    current_price_inr: p.current_price_inr,
    launch_price_inr: p.launch_price_inr,
    is_featured: p.is_featured,
    is_deal_of_the_day: p.is_deal_of_the_day,
    deal_badge_text: p.deal_badge_text,
    tags: p.tags,
    youtube_video_url: p.youtube_video_url,
    created_at: p.created_at,
  }
}
