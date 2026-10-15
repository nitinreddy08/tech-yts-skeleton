import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { discoverStrategy } from '../discover'
import { extractFromHtml } from '../extract'
import type { ScraperConfig } from '../types'

const fx = (n: string) => readFileSync(join(__dirname, 'fixtures', n), 'utf8')
const cfgWith = (strategy: ScraperConfig['strategies'][number]): ScraperConfig => ({ store: 't', hosts: [], strategies: [strategy] })

describe('discoverStrategy (rule-based self-healing)', () => {
  it('finds the new location of the price on a redesigned page and the strategy really reads it', () => {
    const page = { html: fx('amazon-layout-changed.html'), previous: 79999 }
    const r = discoverStrategy([page])
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const read = extractFromHtml(page.html, cfgWith(r.discovery.strategy))
    expect(read).toMatchObject({ ok: true, price: 79999 })
  })

  it('skips struck-through MRP, EMI and carousel prices; picks the id-anchored price across two pages', () => {
    const r = discoverStrategy([
      { html: fx('heal-struck-mrp.html'), previous: 78999 },
      { html: fx('heal-struck-mrp-b.html'), previous: 69999 },
    ])
    expect(r).toMatchObject({ ok: true, discovery: { strategy: { type: 'css', selectors: ['#final-price'] } } })
  })

  it('reads an embedded JSON key (and ignores the MRP / listPrice keys)', () => {
    const r = discoverStrategy([{ html: fx('heal-json-state.html'), previous: 58000 }])
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.discovery.strategy.type).toBe('regex')
    expect(extractFromHtml(fx('heal-json-state.html'), cfgWith(r.discovery.strategy))).toMatchObject({ ok: true, price: 59900 })
  })

  it('refuses when two equally plausible prices exist (ambiguous)', () => {
    const r = discoverStrategy([{ html: fx('heal-ambiguous.html'), previous: 80000 }])
    expect(r).toMatchObject({ ok: false })
    expect(!r.ok && r.reason).toMatch(/ambiguous/)
  })

  it('refuses when nothing is near the last known price', () => {
    expect(discoverStrategy([{ html: fx('heal-nothing.html'), previous: 79999 }])).toMatchObject({ ok: false })
  })

  it('refuses a selector that only works on one of the pages', () => {
    // page B has the same markup but the price moved into a different element.
    const a = '<html><body><h1>A</h1><span class="only-a">₹79,999</span></body></html>'
    const b = '<html><body><h1>B</h1><span class="only-b">₹69,999</span></body></html>'
    const r = discoverStrategy([{ html: a, previous: 79999 }, { html: b, previous: 69999 }])
    expect(r.ok).toBe(false)
  })

  it('needs a last known price to anchor on', () => {
    expect(discoverStrategy([{ html: fx('amazon-layout-changed.html'), previous: 0 }])).toMatchObject({ ok: false })
    expect(discoverStrategy([])).toMatchObject({ ok: false })
  })

  it('does not trust a number far from the last known price (e.g. EMI)', () => {
    const html = '<html><body><h1>X</h1><span id="emi">₹6,667</span></body></html>'
    expect(discoverStrategy([{ html, previous: 79999 }])).toMatchObject({ ok: false })
  })
})
