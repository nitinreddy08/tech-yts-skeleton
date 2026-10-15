import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { extractFromHtml } from '../extract'
import { loadConfigs } from '../load'
import type { ScraperConfig } from '../types'

const ROOT = join(__dirname, '..', '..', '..')
const configs = loadConfigs(join(ROOT, 'config', 'price-scrapers'))
const cfg = (store: string) => configs.find((c) => c.store === store)!
const fixture = (name: string) => readFileSync(join(__dirname, 'fixtures', name), 'utf8')

describe('extractFromHtml', () => {
  it('reads schema.org JSON-LD (layout independent) incl. stock', () => {
    const r = extractFromHtml(fixture('jsonld-product.html'), cfg('generic'))
    expect(r).toMatchObject({ ok: true, price: 79999, stock: 'in_stock', via: 'jsonld' })
  })

  it('falls back to CSS and picks the sale price, not the struck MRP or the EMI', () => {
    const r = extractFromHtml(fixture('amazon-css-only.html'), cfg('amazon'))
    expect(r).toMatchObject({ ok: true, price: 79999, stock: 'in_stock' })
    expect(r.ok && r.via).toMatch(/^css:/)
  })

  it('reports a parse failure (not a wrong price) when the layout changed', () => {
    const r = extractFromHtml(fixture('amazon-layout-changed.html'), cfg('amazon'))
    expect(r).toMatchObject({ ok: false, reason: 'parse' })
  })

  it('reads prices from embedded page state via regex', () => {
    const r = extractFromHtml(fixture('flipkart-state.html'), cfg('flipkart'))
    expect(r).toMatchObject({ ok: true, price: 69999 })
  })

  it('tells a bot check apart from a changed layout', () => {
    expect(extractFromHtml(fixture('blocked.html'), cfg('amazon'))).toMatchObject({ ok: false, reason: 'blocked' })
  })

  it('treats an unavailable product with no price as out of stock, not broken', () => {
    expect(extractFromHtml(fixture('out-of-stock.html'), cfg('amazon'))).toMatchObject({
      ok: false,
      reason: 'parse',
      outOfStock: true,
    })
  })

  it('refuses prices that are not in INR', () => {
    expect(extractFromHtml(fixture('foreign-currency.html'), cfg('generic'))).toMatchObject({
      ok: false,
      reason: 'currency',
    })
  })

  it('ignores an invalid selector instead of throwing', () => {
    const bad: ScraperConfig = { store: 't', hosts: [], strategies: [{ type: 'css', selectors: ['div[[['] }] }
    expect(extractFromHtml('<div>x</div>', bad)).toMatchObject({ ok: false })
  })

  it('rejects implausible numbers (min/max bounds)', () => {
    const html = '<span id="p">₹5</span>'
    const c: ScraperConfig = { store: 't', hosts: [], strategies: [{ type: 'css', selectors: ['#p'] }], minPrice: 100 }
    expect(extractFromHtml(html, c)).toMatchObject({ ok: false })
  })
})

// Every config's own regression samples: this is what `/update-scraper` must keep green.
describe('config samples', () => {
  for (const c of configs) {
    for (const s of c.samples ?? []) {
      it(`${c.store}: ${s.fixture}`, () => {
        const r = extractFromHtml(readFileSync(join(ROOT, s.fixture), 'utf8'), c)
        expect(r).toMatchObject({ ok: true, price: s.expectedPrice })
        if (s.expectedStock) expect(r.ok && r.stock).toBe(s.expectedStock)
      })
    }
  }
})
