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
import { db } from './db'
import {
  productRepository,
  dealRepository,
  bestOfListRepository,
  clickLogRepository,
  categoryRepository,
  brandRepository,
} from '@/lib/repositories'
import { repositoryErrorResponse } from './http-error'
import type { DealType } from '@/lib/schemas'

const BASE = '/api/mock'

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoryHandlers = [
  // GET /api/mock/categories
  http.get(`${BASE}/categories`, async () => {
    return HttpResponse.json(await categoryRepository.list())
  }),

  // GET /api/mock/categories/:slug
  http.get(`${BASE}/categories/:slug`, async ({ params }) => {
    const cat = await categoryRepository.findBySlug(params.slug as string)
    if (!cat) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(cat)
  }),

  // GET /api/mock/categories/by-id/:id
  http.get(`${BASE}/categories/by-id/:id`, async ({ params }) => {
    const cat = await categoryRepository.findById(params.id as string)
    if (!cat) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(cat)
  }),
]

// ─── Brands ───────────────────────────────────────────────────────────────────

export const brandHandlers = [
  // GET /api/mock/brands
  http.get(`${BASE}/brands`, async () => {
    return HttpResponse.json(await brandRepository.list())
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
  http.get(`${BASE}/best-of-lists`, async ({ request }) => {
    const url = new URL(request.url)
    const publishedOnly = url.searchParams.get('published') !== 'false'
    return HttpResponse.json(await bestOfListRepository.list({ publishedOnly }))
  }),

  // GET /api/mock/best-of-lists/by-slug/:slug
  http.get(`${BASE}/best-of-lists/by-slug/:slug`, async ({ params }) => {
    const list = await bestOfListRepository.findBySlug(params.slug as string)
    if (!list) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(list)
  }),

  // GET /api/mock/best-of-lists/:id
  http.get(`${BASE}/best-of-lists/:id`, async ({ params }) => {
    const list = await bestOfListRepository.findById(params.id as string)
    if (!list) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(list)
  }),

  // POST /api/mock/best-of-lists
  http.post(`${BASE}/best-of-lists`, async ({ request }) => {
    const body = await request.json()
    try {
      const list = await bestOfListRepository.create(body)
      return HttpResponse.json(list, { status: 201 })
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // PATCH /api/mock/best-of-lists/:id
  http.patch(`${BASE}/best-of-lists/:id`, async ({ params, request }) => {
    const body = await request.json()
    try {
      const list = await bestOfListRepository.update(params.id as string, body)
      return HttpResponse.json(list)
    } catch (error) {
      return repositoryErrorResponse(error)
    }
  }),

  // DELETE /api/mock/best-of-lists/:id
  http.delete(`${BASE}/best-of-lists/:id`, async ({ params }) => {
    try {
      await bestOfListRepository.remove(params.id as string)
      return new HttpResponse(null, { status: 204 })
    } catch (error) {
      return repositoryErrorResponse(error)
    }
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
    const body = await request.json()
    try {
      const log = await clickLogRepository.record(body)
      return HttpResponse.json(log, { status: 201 })
    } catch (error) {
      return repositoryErrorResponse(error)
    }
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

