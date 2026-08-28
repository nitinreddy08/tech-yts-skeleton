/**
 * lib/mock/handlers.ts
 *
 * MSW request handlers.  These intercept fetch() calls made from browser-side
 * code (DynamicSpecForm, etc.) against the /api/mock/* namespace and route
 * them through the same repositories server code uses.
 *
 * NOTE: Server Components, Server Actions, and Route Handlers import
 * lib/mock/db.ts (or the repositories) directly — they don't go through these
 * handlers. Real Next.js Route Handlers under /api/* (e.g. /api/search) are
 * deliberately left unregistered here too, so they aren't shadowed in the
 * browser during development — see the Search section below.
 */

import { http, HttpResponse } from 'msw'
import {
  db,
  newId,
} from './db'
import { productRepository, dealRepository } from '@/lib/repositories'
import { repositoryErrorResponse } from './http-error'
import { toProductSummary as productSummaryFromDetail } from '@/lib/repositories/in-memory/mappers'
import type { DealType } from '@/lib/schemas'

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
  // GET /api/mock/products — published products (summary shape), optionally paginated
  http.get(`${BASE}/products`, async ({ request }) => {
    const url = new URL(request.url)
    const categorySlug = url.searchParams.get('category') ?? undefined
    const featured = url.searchParams.get('featured') === 'true' ? true : undefined
    const limit = Number(url.searchParams.get('limit') ?? '100')

    if (url.searchParams.has('page')) {
      const page = Number(url.searchParams.get('page') ?? '1')
      const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
      const result = await productRepository.paginate(
        { categorySlug, featured, sort: 'newest' },
        page,
        pageSize
      )
      return HttpResponse.json({ data: result.data, count: result.count })
    }

    const list = await productRepository.list({
      categorySlug,
      featured,
      sort: 'newest',
      limit,
    })
    return HttpResponse.json(list)
  }),

  // GET /api/mock/products/all — admin: all products regardless of is_published
  http.get(`${BASE}/products/all`, async ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
    const result = await productRepository.paginate(
      { includeUnpublished: true, sort: 'newest' },
      page,
      pageSize
    )
    return HttpResponse.json({ data: result.data, count: result.count })
  }),

  // GET /api/mock/products/published-list — simple {id, name} list for dropdowns
  http.get(`${BASE}/products/published-list`, async () => {
    return HttpResponse.json(await productRepository.publishedOptions())
  }),

  // GET /api/mock/products/by-slug/:slug
  http.get(`${BASE}/products/by-slug/:slug`, async ({ params }) => {
    const product = await productRepository.findBySlug(params.slug as string)
    if (!product) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(product)
  }),

  // GET /api/mock/products/by-id/:id  — admin, no is_published filter
  http.get(`${BASE}/products/by-id/:id`, async ({ params }) => {
    const product = await productRepository.findById(params.id as string, {
      includeUnpublished: true,
    })
    if (!product) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(product)
  }),

  // POST /api/mock/products — create
  http.post(`${BASE}/products`, async ({ request }) => {
    const body = await request.json()
    try {
      const product = await productRepository.create(body)
      return HttpResponse.json(product, { status: 201 })
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // PATCH /api/mock/products/:id — update
  http.patch(`${BASE}/products/:id`, async ({ params, request }) => {
    const body = await request.json()
    try {
      const product = await productRepository.update(params.id as string, body)
      return HttpResponse.json(product)
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // DELETE /api/mock/products/:id
  http.delete(`${BASE}/products/:id`, async ({ params }) => {
    try {
      await productRepository.remove(params.id as string)
      return new HttpResponse(null, { status: 204 })
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // PATCH /api/mock/products/:id/toggle-publish
  http.patch(`${BASE}/products/:id/toggle-publish`, async ({ params }) => {
    try {
      const product = await productRepository.togglePublish(params.id as string)
      return HttpResponse.json(product)
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),
]

// ─── Search ───────────────────────────────────────────────────────────────────
//
// No MSW handler for /api/search: it's a real Next.js Route Handler
// (app/api/search/route.ts, backed by lib/data/search.ts's
// productRepository-powered searchProductsFull). Registering a mock here would
// shadow it in the browser during development — SearchBar and HeroFinder fetch
// this same path client-side — so client-side search would silently run a
// different, simpler algorithm than the server-rendered /search page and
// production ever use. Leaving the path unregistered lets
// `onUnhandledRequest: 'bypass'` route it straight to the real handler.

// ─── Deals ────────────────────────────────────────────────────────────────────

export const dealHandlers = [
  // GET /api/mock/deals
  http.get(`${BASE}/deals`, async ({ request }) => {
    const url = new URL(request.url)
    const liveOnly = url.searchParams.get('active') === 'true'
    const type = (url.searchParams.get('type') as DealType | null) ?? undefined

    const list = await dealRepository.list({ liveOnly, type })
    return HttpResponse.json(list)
  }),

  // GET /api/mock/deals/:id
  http.get(`${BASE}/deals/:id`, async ({ params }) => {
    const deal = await dealRepository.findById(params.id as string)
    if (!deal) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(deal)
  }),

  // POST /api/mock/deals
  http.post(`${BASE}/deals`, async ({ request }) => {
    const body = await request.json()
    try {
      const deal = await dealRepository.create(body)
      return HttpResponse.json(deal, { status: 201 })
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // PATCH /api/mock/deals/:id
  http.patch(`${BASE}/deals/:id`, async ({ params, request }) => {
    const body = await request.json()
    try {
      const deal = await dealRepository.update(params.id as string, body)
      return HttpResponse.json(deal)
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // DELETE /api/mock/deals/:id
  http.delete(`${BASE}/deals/:id`, async ({ params }) => {
    try {
      await dealRepository.remove(params.id as string)
      return new HttpResponse(null, { status: 204 })
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // PATCH /api/mock/deals/:id/toggle-active
  http.patch(`${BASE}/deals/:id/toggle-active`, async ({ params }) => {
    try {
      const deal = await dealRepository.toggleActive(params.id as string)
      return HttpResponse.json(deal)
    } catch (error) {
      return repositoryErrorResponse(error)
    }
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
  ...dealHandlers,
  ...bestOfListHandlers,
  ...affiliateHandlers,
  ...statsHandlers,
  ...authHandlers,
  ...storageHandlers,
]

