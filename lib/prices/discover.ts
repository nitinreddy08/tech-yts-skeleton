import * as cheerio from 'cheerio'
import { extractFromHtml, readSelector } from './extract'
import { parsePrice } from './parse'
import type { Strategy } from './types'

/**
 * Rule-based self-healing — no AI. When a store's pages stop parsing, we know something the
 * scraper didn't: the LAST KNOWN PRICE. So we look through the saved page for numbers close to it
 * (a believable band around it), work out a stable way to read each one (an id, an itemprop, a data-*
 * attribute, an embedded JSON key, or a class chain), and only accept a way of reading that
 *   1. gives a believable price on EVERY saved page of that store (not just the one it came from), and
 *   2. is unambiguous: no equally-good rival that reads a different number.
 * Anything less returns null and a human is told. A wrong accept is still caught later by the run-time
 * outlier guard, the sample tests and the live re-check.
 */

export interface DiscoveryPage {
  html: string
  /** Last known price for this link (what we expect to find again). */
  previous: number
}

export interface Discovery {
  strategy: Strategy
  /** Human-readable proof, printed by the CLI and kept in the config's `healed` log. */
  evidence: string[]
}

export type DiscoveryResult = { ok: true; discovery: Discovery } | { ok: false; reason: string }

const BAND_LOW = 0.75
const BAND_HIGH = 1.25
/** A rival must lose by at least this much, otherwise the page is ambiguous. */
const MARGIN = 1

const inBand = (price: number | null, previous: number): price is number =>
  price != null && price >= previous * BAND_LOW && price <= previous * BAND_HIGH

/** Words that mean "not the selling price" (struck-through MRP, EMI, cashback...). */
const NEGATIVE = /(^|[^a-z])(mrp|list|original|was|old|strike|cut|emi|cashback|saving|savings|discount|off|compare|crossed|struck|max)([^a-z]|$)|listprice|oldprice|originalprice|strikeprice|baseprice|maxprice/i

const PRICE_TEXT = /^(?:₹|Rs\.?|INR)?\s*(\d[\d,]*(?:\.\d+)?)\s*(?:\/-)?$/i
const KEY_PRIORITY = ['sellingPrice', 'finalPrice', 'offerPrice', 'salePrice', 'discountedPrice', 'currentPrice', 'specialPrice', 'special_price', 'price', 'amount']
const SAFE_TOKEN = /^[A-Za-z_][A-Za-z0-9_-]*$/
const UNSTABLE_CLASS = /(^|[-_])(is|has)[-_]|active|hidden|selected|disabled|open|show|focus|hover|loading|visible/i

interface Candidate {
  strategy: Strategy
  value: number
  weight: number
  how: string
}

const strategyKey = (s: Strategy) => JSON.stringify(s)

// ── JSON-in-script candidates ────────────────────────────────────────────────────────────────────

function jsonCandidates(html: string, previous: number): Candidate[] {
  const out: Candidate[] = []
  const direct = /"([A-Za-z_]*[Pp]rice[A-Za-z_]*|amount)"\s*:\s*"?(\d[\d,]*(?:\.\d+)?)"?/g
  const nested = /"([A-Za-z_]*[Pp]rice[A-Za-z_]*)"\s*:\s*\{[^{}]*?"(?:value|amount)"\s*:\s*"?(\d[\d,]*(?:\.\d+)?)"?/g
  const seen = new Set<string>()

  for (const [re, isNested] of [[direct, false], [nested, true]] as const) {
    for (const m of html.matchAll(re)) {
      const key = m[1]
      const value = parsePrice(m[2])
      if (NEGATIVE.test(key) || !inBand(value, previous)) continue
      const pattern = isNested
        ? `"${key}"\\s*:\\s*\\{[^{}]*?"(?:value|amount)"\\s*:\\s*"?(\\d+(?:\\.\\d+)?)`
        : `"${key}"\\s*:\\s*"?(\\d+(?:\\.\\d+)?)"?`
      if (seen.has(pattern)) continue
      seen.add(pattern)
      const idx = KEY_PRIORITY.findIndex((k) => k.toLowerCase() === key.toLowerCase())
      out.push({
        strategy: { type: 'regex', patterns: [pattern] },
        value: value!,
        weight: 4 - (idx === -1 ? 3 : idx * 0.3),
        how: `JSON key "${key}"${isNested ? ' (nested value)' : ''}`,
      })
    }
  }
  return out
}

// ── DOM candidates ───────────────────────────────────────────────────────────────────────────────

function stableClasses(cls: string | undefined): string[] {
  return (cls ?? '')
    .split(/\s+/)
    .filter((c) => SAFE_TOKEN.test(c) && c.length <= 30 && !UNSTABLE_CLASS.test(c))
    .slice(0, 3)
}

function domCandidates(html: string, previous: number): Candidate[] {
  const $ = cheerio.load(html)
  const all = $('*').toArray()
  const order = new Map(all.map((el, i) => [el, i]))
  const h1 = $('h1').first().get(0)
  const h1Index = h1 ? (order.get(h1) ?? -1) : -1
  const out: Candidate[] = []
  const seen = new Set<string>()

  const looksNegative = (el: (typeof all)[number]): boolean => {
    let cur: (typeof all)[number] | null = el
    for (let depth = 0; cur && depth < 5; depth++, cur = (cur.parent as typeof el | null)) {
      if (cur.type !== 'tag') continue
      if (['del', 's', 'strike'].includes(cur.name)) return true
      const label = `${cur.attribs?.class ?? ''} ${cur.attribs?.id ?? ''}`
      if (NEGATIVE.test(label)) return true
    }
    return false
  }

  const add = (selector: string, value: number, weight: number, how: string, el: (typeof all)[number]) => {
    const afterH1 = h1Index === -1 || (order.get(el) ?? 0) > h1Index
    // Must actually read this value back on the page, as the first match.
    const strategy: Strategy = { type: 'css', selectors: [selector] }
    const read = parsePrice(readSelector($, selector))
    if (read !== value || seen.has(strategyKey(strategy))) return
    seen.add(strategyKey(strategy))
    out.push({ strategy, value, weight: weight - (afterH1 ? 0 : 1.5), how })
  }

  for (const el of all) {
    if (el.type !== 'tag' || ['script', 'style', 'noscript', 'head', 'title'].includes(el.name) || looksNegative(el)) continue
    const $el = $(el)
    const tag = el.name

    // a) numeric attribute (data-amount="79999", data-price=...)
    for (const [name, raw] of Object.entries(el.attribs ?? {})) {
      if (!/price|amount|cost/i.test(name) || NEGATIVE.test(name) || !/^\d+(\.\d+)?$/.test(raw)) continue
      const value = parsePrice(raw)
      if (!inBand(value, previous)) continue
      add(`${tag}[${name}]@${name}`, value!, 4.5, `attribute ${name} on <${tag}>`, el)
    }

    // b) element whose own text is just a price
    const own = $el.contents().filter((_, n) => n.type === 'text').text().trim()
    const m = own.match(PRICE_TEXT)
    if (!m) continue
    const value = parsePrice(m[1])
    if (!inBand(value, previous)) continue

    const classes = stableClasses(el.attribs?.class)
    const classPart = classes.map((c) => `.${c}`).join('')
    const id = el.attribs?.id
    if (id && SAFE_TOKEN.test(id) && !/\d{4,}/.test(id)) add(`#${id}`, value!, 5, `id #${id}`, el)
    if (el.attribs?.itemprop === 'price') add(`${tag}[itemprop="price"]`, value!, 5, 'itemprop="price"', el)
    for (const [name, v] of Object.entries(el.attribs ?? {})) {
      if (name.startsWith('data-') && v && v.length <= 40 && !/^\d+(\.\d+)?$/.test(v) && !/["\\]/.test(v)) {
        add(`${tag}[${name}="${v}"]`, value!, 4, `${name}="${v}"`, el)
      }
    }
    // nearest anchored ancestor (id or data-testid/test/qa) + this element
    let anc = el.parent as typeof el | null
    for (let depth = 0; anc && depth < 4; depth++, anc = anc.parent as typeof el | null) {
      if (anc.type !== 'tag') continue
      const aid = anc.attribs?.id
      const testid = anc.attribs?.['data-testid'] ?? anc.attribs?.['data-test'] ?? anc.attribs?.['data-qa']
      const anchor = aid && SAFE_TOKEN.test(aid) && !/\d{4,}/.test(aid) ? `#${aid}` : testid && !/["\\]/.test(testid) ? `[data-testid="${testid}"]` : null
      if (anchor && (classPart || tag)) {
        add(`${anchor} ${tag}${classPart}`, value!, 3, `${anchor} → ${tag}${classPart}`, el)
        break
      }
    }
    if (classPart) add(`${tag}${classPart}`, value!, 2, `class ${tag}${classPart}`, el)
  }
  return out
}

// ── choosing ─────────────────────────────────────────────────────────────────────────────────────

function priceOn(page: DiscoveryPage, strategy: Strategy): number | null {
  const r = extractFromHtml(page.html, { store: 'discover', hosts: [], strategies: [strategy], minPrice: 1, maxPrice: 1e9 })
  return r.ok ? r.price : null
}

export function discoverStrategy(pages: DiscoveryPage[]): DiscoveryResult {
  const usable = pages.filter((p) => p.previous > 0 && p.html)
  if (usable.length === 0) return { ok: false, reason: 'no saved pages with a last known price to anchor on' }

  const byKey = new Map<string, Candidate>()
  for (const page of usable) {
    for (const c of [...jsonCandidates(page.html, page.previous), ...domCandidates(page.html, page.previous)]) {
      const k = strategyKey(c.strategy)
      const existing = byKey.get(k)
      if (!existing || c.weight > existing.weight) byKey.set(k, c)
    }
  }
  if (byKey.size === 0) return { ok: false, reason: 'no number near the last known price was found on the page' }

  // Keep only ways of reading that give a believable price on EVERY saved page.
  const viable: { c: Candidate; prices: number[] }[] = []
  for (const c of byKey.values()) {
    const prices = usable.map((p) => priceOn(p, c.strategy))
    if (prices.every((v, i) => inBand(v, usable[i].previous))) viable.push({ c, prices: prices as number[] })
  }
  if (viable.length === 0) return { ok: false, reason: 'no single selector reads a believable price on every saved page' }

  // Group by what they read; the winner must clearly beat every other reading.
  const groups = new Map<string, { best: Candidate; prices: number[] }>()
  for (const v of viable) {
    const k = v.prices.join(',')
    const g = groups.get(k)
    if (!g || v.c.weight > g.best.weight) groups.set(k, { best: v.c, prices: v.prices })
  }
  const ranked = [...groups.values()].sort((a, b) => b.best.weight - a.best.weight)
  if (ranked.length > 1 && ranked[0].best.weight - ranked[1].best.weight < MARGIN) {
    return {
      ok: false,
      reason: `ambiguous: the page has several equally plausible prices (${ranked
        .slice(0, 3)
        .map((g) => `₹${g.prices[0]} via ${g.best.how}`)
        .join('; ')})`,
    }
  }

  const win = ranked[0]
  return {
    ok: true,
    discovery: {
      strategy: win.best.strategy,
      evidence: [
        `${win.best.how}`,
        `reads ${usable.map((p, i) => `₹${win.prices[i]} (expected ≈ ₹${p.previous})`).join(', ')} on ${usable.length} saved page(s)`,
        ranked.length > 1 ? `beat ${ranked.length - 1} other candidate(s) by ≥ ${MARGIN} point` : 'no other candidate in range',
      ],
    },
  }
}
