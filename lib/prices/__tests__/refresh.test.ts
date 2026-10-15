import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { refreshPrices, configFor, type RefreshDeps } from '../refresh'
import { isPlausibleChange } from '../validate'
import { applyPriceSnapshot, syncCurrentPrices } from '../apply'
import { buildApiRequest, readApiResponse } from '../api'
import { loadConfigs } from '../load'
import type { LinkInput, ScraperConfig } from '../types'

const ROOT = join(__dirname, '..', '..', '..')
const configs = loadConfigs(join(ROOT, 'config', 'price-scrapers'))
const fx = (n: string) => readFileSync(join(__dirname, 'fixtures', n), 'utf8')

function deps(pages: Record<string, { status?: number; html?: string; throws?: boolean }>, env = {}): RefreshDeps {
  return {
    env,
    now: () => new Date('2026-09-01T00:00:00Z'),
    sleep: async () => {},
    fetchPage: async (url) => {
      const p = pages[url]
      if (!p || p.throws) throw new Error('ECONNRESET')
      return { status: p.status ?? 200, html: p.html ?? '' }
    },
    fetchJson: async (url) => {
      const p = pages[url]
      if (!p || p.throws) throw new Error('ECONNRESET')
      return { status: p.status ?? 200, json: JSON.parse(p.html ?? 'null') }
    },
  }
}

const link = (id: string, url: string, price: number | null = 79999): LinkInput => ({
  id, store_name: 'x', affiliate_url: url, price_inr: price,
})
const base = { sources: {}, configs, previous: { generated_at: null, entries: {} }, previousHealth: { generated_at: null, stores: {} } }

describe('configFor', () => {
  it('matches hosts by suffix and falls back to generic', () => {
    expect(configFor('https://www.amazon.in/dp/B0', configs).store).toBe('amazon')
    expect(configFor('https://dl.flipkart.com/s/x', configs).store).toBe('flipkart')
    expect(configFor('https://www.apple.com/in/shop', configs).store).toBe('generic')
    expect(configFor('https://notamazon.in/x', configs).store).toBe('generic')
  })
})

describe('isPlausibleChange', () => {
  it('accepts normal moves and rejects wild ones', () => {
    expect(isPlausibleChange(74999, 79999)).toBe(true)
    expect(isPlausibleChange(6667, 79999)).toBe(false) // the EMI, not the price
    expect(isPlausibleChange(200000, 79999)).toBe(false)
    expect(isPlausibleChange(5000, null)).toBe(true)
  })
})

describe('refreshPrices', () => {
  const url = 'https://www.amazon.in/dp/B0S25'

  it('records a good price with its stock and method', async () => {
    const { snapshot, results } = await refreshPrices({
      ...base, links: [link('a', url)], deps: deps({ [url]: { html: fx('amazon-css-only.html') } }),
    })
    expect(results[0]).toMatchObject({ status: 'ok', price: 79999 })
    expect(snapshot.entries.a).toMatchObject({ price_inr: 79999, stock_status: 'in_stock', last_updated: '2026-09-01T00:00:00.000Z' })
  })

  it('skips placeholder URLs without calling them broken', async () => {
    const { results, health } = await refreshPrices({
      ...base, links: [link('a', 'https://amazon.in/dp/mock-s25')], deps: deps({}),
    })
    expect(results[0]).toMatchObject({ status: 'skipped', reason: 'placeholder_url' })
    expect(health.stores.amazon.status).toBe('idle')
  })

  it('flags a changed layout as broken and keeps the old price', async () => {
    const previous = { generated_at: 'x', entries: { a: { price_inr: 79999, last_updated: 'old', via: 'css' } } }
    const { snapshot, health, results } = await refreshPrices({
      ...base, previous, links: [link('a', url)], deps: deps({ [url]: { html: fx('amazon-layout-changed.html') } }),
    })
    expect(results[0]).toMatchObject({ status: 'failed', reason: 'parse' })
    expect(results[0].html).toContain('buybox') // kept so the repair step can read it
    expect(snapshot.entries.a.price_inr).toBe(79999)
    expect(health.stores.amazon.status).toBe('broken')
  })

  it('treats HTTP 403/429 and bot-check pages as blocked, not broken', async () => {
    const u2 = 'https://www.amazon.in/dp/B0S26'
    const { health } = await refreshPrices({
      ...base, links: [link('a', url), link('b', u2)],
      deps: deps({ [url]: { status: 403 }, [u2]: { html: fx('blocked.html') } }),
    })
    expect(health.stores.amazon.status).toBe('blocked')
  })

  it('is degraded when only some links fail', async () => {
    const u2 = 'https://www.amazon.in/dp/B0S26'
    const u3 = 'https://www.amazon.in/dp/B0S27'
    const { health } = await refreshPrices({
      ...base, links: [link('a', url), link('b', u2), link('c', u3)],
      deps: deps({
        [url]: { html: fx('amazon-css-only.html') },
        [u2]: { html: fx('amazon-css-only.html') },
        [u3]: { throws: true },
      }),
    })
    expect(health.stores.amazon).toMatchObject({ status: 'degraded', ok: 2 })
    expect(health.stores.amazon.failed.network).toBe(1)
  })

  it('rejects an implausible price (wrong element) unless told to accept it', async () => {
    const html = '<script type="application/ld+json">{"@type":"Product","offers":{"priceCurrency":"INR","price":"9999"}}</script>'
    const u = 'https://www.apple.com/in/x'
    const strict = await refreshPrices({ ...base, links: [link('a', u, 79999)], deps: deps({ [u]: { html } }) })
    expect(strict.results[0]).toMatchObject({ status: 'failed', reason: 'outlier' })
    const lax = await refreshPrices({ ...base, links: [link('a', u, 79999)], deps: deps({ [u]: { html } }), acceptOutliers: true })
    expect(lax.results[0]).toMatchObject({ status: 'ok', price: 9999 })
  })

  it('marks an unavailable page out of stock and keeps the last price', async () => {
    const { snapshot } = await refreshPrices({
      ...base, links: [link('a', url)], deps: deps({ [url]: { html: fx('out-of-stock.html') } }),
    })
    expect(snapshot.entries.a).toMatchObject({ price_inr: 79999, stock_status: 'out_of_stock' })
  })

  it('limits a run to one store', async () => {
    const { results } = await refreshPrices({
      ...base, onlyStore: 'flipkart', links: [link('a', url)], deps: deps({ [url]: { html: fx('amazon-css-only.html') } }),
    })
    expect(results).toHaveLength(0)
  })
})

describe('official API step', () => {
  const api: NonNullable<ScraperConfig['api']> = {
    url: 'https://api.example-store.test/p?id={id}',
    headers: { 'x-token': '${STORE_TOKEN}' },
    pricePath: 'product.price.amount',
    inStockPath: 'product.available',
  }
  const apiCfg: ScraperConfig = { store: 'shop', hosts: ['shop.test'], strategies: [{ type: 'jsonld' }], api }

  it('builds the request from env, or skips when credentials are missing', () => {
    expect(buildApiRequest(api, 'X1', { STORE_TOKEN: 't' })).toEqual({
      url: 'https://api.example-store.test/p?id=X1', headers: { 'x-token': 't' },
    })
    expect(buildApiRequest(api, 'X1', {})).toBeNull()
  })

  it('reads price and stock from the response', () => {
    expect(readApiResponse(api, { product: { price: { amount: '1,299' }, available: false } })).toEqual({
      price: 1299, stock: 'out_of_stock',
    })
  })

  it('prefers the API, and falls back to the page when there are no credentials', async () => {
    const page = 'https://shop.test/p/1'
    const apiUrl = 'https://api.example-store.test/p?id=X1'
    const pages = {
      [apiUrl]: { html: JSON.stringify({ product: { price: { amount: 79000 }, available: true } }) },
      [page]: { html: fx('jsonld-product.html') },
    }
    const l = link('a', page)
    const withKey = await refreshPrices({ ...base, configs: [apiCfg], sources: { a: { apiId: 'X1' } }, links: [l], deps: deps(pages, { STORE_TOKEN: 't' }) })
    expect(withKey.snapshot.entries.a).toMatchObject({ price_inr: 79000, via: 'api' })
    const noKey = await refreshPrices({ ...base, configs: [apiCfg], sources: { a: { apiId: 'X1' } }, links: [l], deps: deps(pages) })
    expect(noKey.snapshot.entries.a).toMatchObject({ price_inr: 79999, via: 'jsonld' })
  })
})

describe('site overlay', () => {
  const mk = (id: string, price: number | null, stock?: 'in_stock' | 'out_of_stock') => ({
    id, price_inr: price, stock_status: stock, last_updated: 'old', is_best_price: false,
  })

  it('applies snapshot prices onto links and ignores unknown ids', () => {
    const links = [mk('a', 100), mk('b', 200)]
    const n = applyPriceSnapshot(links, {
      generated_at: 'x',
      entries: { a: { price_inr: 90, stock_status: 'out_of_stock', last_updated: 'new', via: 'api' }, zzz: { price_inr: 1, last_updated: 'n', via: 'api' } },
    })
    expect(n).toBe(1)
    expect(links[0]).toMatchObject({ price_inr: 90, stock_status: 'out_of_stock', last_updated: 'new' })
    expect(links[1].price_inr).toBe(200)
  })

  it('moves the headline price and best flag to the cheapest in-stock store', () => {
    const links = [mk('a', 90, 'out_of_stock'), mk('b', 120, 'in_stock'), mk('c', 150, 'in_stock')]
    const product = { current_price_inr: 100 as number | null, affiliate_links: links }
    syncCurrentPrices([product])
    expect(product.current_price_inr).toBe(120)
    expect(links.map((l) => l.is_best_price)).toEqual([false, true, false])
  })

  it('leaves a product with no purchasable priced link alone', () => {
    const product = { current_price_inr: 100 as number | null, affiliate_links: [mk('a', null)] }
    syncCurrentPrices([product])
    expect(product.current_price_inr).toBe(100)
  })
})
