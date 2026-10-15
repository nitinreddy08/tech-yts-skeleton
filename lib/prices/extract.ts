import * as cheerio from 'cheerio'
import { parsePrice } from './parse'
import type { ExtractResult, ScraperConfig, StockStatus, Strategy } from './types'

const DEFAULT_BLOCKED = [
  'enter the characters you see below',
  'robot check',
  'are you a human',
  'unusual traffic',
  'access denied',
  'request blocked',
  'captcha',
]

const AVAILABILITY: Record<string, StockStatus> = {
  instock: 'in_stock',
  onlineonly: 'in_stock',
  instoreonly: 'in_stock',
  limitedavailability: 'low_stock',
  outofstock: 'out_of_stock',
  soldout: 'out_of_stock',
  discontinued: 'out_of_stock',
}

function stockFromSchema(value: unknown): StockStatus | undefined {
  if (typeof value !== 'string') return undefined
  return AVAILABILITY[value.split('/').pop()!.toLowerCase()]
}

/** `selector@attr` → [selector, attr]; a plain selector reads text (or `defaultAttr`). */
function splitSelector(sel: string, defaultAttr?: string): [string, string | undefined] {
  const at = sel.lastIndexOf('@')
  if (at > 0 && /^[a-z][a-z0-9-]*$/i.test(sel.slice(at + 1))) return [sel.slice(0, at), sel.slice(at + 1)]
  return [sel, defaultAttr]
}

export function readSelector($: cheerio.CheerioAPI, sel: string, defaultAttr?: string): string | null {
  const [css, attr] = splitSelector(sel, defaultAttr)
  let el
  try {
    el = $(css).first()
  } catch {
    return null // an invalid selector must not take the whole run down
  }
  if (el.length === 0) return null
  return attr ? (el.attr(attr) ?? null) : el.text().trim()
}

/** Every Product-like node inside the page's JSON-LD blocks. */
function jsonLdProducts($: cheerio.CheerioAPI): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = []
  const visit = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(visit)
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>
    const type = obj['@type']
    const types = Array.isArray(type) ? type : [type]
    if (types.some((t) => typeof t === 'string' && /product/i.test(t))) found.push(obj)
    if (obj['@graph']) visit(obj['@graph'])
  }
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      visit(JSON.parse($(el).contents().text()))
    } catch {
      /* malformed JSON-LD is common; ignore that block */
    }
  })
  return found
}

interface Hit {
  price: number
  stock?: StockStatus
  via: string
}

function tryJsonLd($: cheerio.CheerioAPI, ok: (n: number) => boolean): Hit | 'currency' | null {
  for (const product of jsonLdProducts($)) {
    const offers = ([] as unknown[]).concat((product.offers as unknown) ?? [])
    for (const offer of offers) {
      if (!offer || typeof offer !== 'object') continue
      const o = offer as Record<string, unknown>
      const currency = o.priceCurrency
      if (typeof currency === 'string' && currency.toUpperCase() !== 'INR') return 'currency'
      const price = parsePrice((o.price ?? o.lowPrice) as string | number | undefined)
      if (price != null && ok(price)) return { price, stock: stockFromSchema(o.availability), via: 'jsonld' }
    }
  }
  return null
}

function tryMeta($: cheerio.CheerioAPI, selectors: string[], ok: (n: number) => boolean): Hit | 'currency' | null {
  const currency = $('meta[property="product:price:currency"], meta[property="og:price:currency"]').attr('content')
  if (currency && currency.toUpperCase() !== 'INR') return 'currency'
  for (const sel of selectors) {
    const price = parsePrice(readSelector($, sel, 'content'))
    if (price != null && ok(price)) return { price, via: `meta:${sel}` }
  }
  return null
}

function tryCss($: cheerio.CheerioAPI, selectors: string[], ok: (n: number) => boolean): Hit | null {
  for (const sel of selectors) {
    const price = parsePrice(readSelector($, sel))
    if (price != null && ok(price)) return { price, via: `css:${sel}` }
  }
  return null
}

function tryRegex(html: string, patterns: string[], ok: (n: number) => boolean): Hit | null {
  for (const p of patterns) {
    let re: RegExp
    try {
      re = new RegExp(p)
    } catch {
      continue
    }
    const price = parsePrice(html.match(re)?.[1])
    if (price != null && ok(price)) return { price, via: `regex:${p}` }
  }
  return null
}

function stockFromPage($: cheerio.CheerioAPI, cfg: ScraperConfig): StockStatus | undefined {
  const a = cfg.availability
  if (!a) return undefined
  const text = a.selectors.map((s) => readSelector($, s) ?? '').join(' ').toLowerCase()
  if (!text.trim()) return undefined
  if (a.outOfStockTexts?.some((t) => text.includes(t.toLowerCase()))) return 'out_of_stock'
  if (a.lowStockTexts?.some((t) => text.includes(t.toLowerCase()))) return 'low_stock'
  return 'in_stock'
}

export function looksBlocked(html: string, cfg: Pick<ScraperConfig, 'blockedTexts'>): string | null {
  const head = html.slice(0, 40000).toLowerCase()
  for (const t of [...(cfg.blockedTexts ?? []), ...DEFAULT_BLOCKED]) {
    if (head.includes(t.toLowerCase())) return t
  }
  return null
}

/**
 * Runs the config's strategies over a page in order and returns the first
 * plausible price. Order is the self-healing: JSON-LD and meta tags survive most
 * redesigns, so CSS selectors are only the last resort for stores that need them.
 */
export function extractFromHtml(html: string, cfg: ScraperConfig): ExtractResult {
  const min = cfg.minPrice ?? 100
  const max = cfg.maxPrice ?? 5_000_000
  const ok = (n: number) => n >= min && n <= max
  const $ = cheerio.load(html)
  let sawCurrency = false

  for (const s of cfg.strategies as Strategy[]) {
    let hit: Hit | 'currency' | null = null
    if (s.type === 'jsonld') hit = tryJsonLd($, ok)
    else if (s.type === 'meta') hit = tryMeta($, s.selectors, ok)
    else if (s.type === 'css') hit = tryCss($, s.selectors, ok)
    else if (s.type === 'regex') hit = tryRegex(html, s.patterns, ok)

    if (hit === 'currency') {
      sawCurrency = true
      continue
    }
    if (hit) return { ok: true, price: hit.price, stock: hit.stock ?? stockFromPage($, cfg), via: hit.via }
  }

  if (sawCurrency) return { ok: false, reason: 'currency', detail: 'page prices are not in INR' }
  const blocked = looksBlocked(html, cfg)
  if (blocked) return { ok: false, reason: 'blocked', detail: `page contains “${blocked}”` }
  // Unavailable products often hide the price; that is "out of stock", not a broken layout.
  if (stockFromPage($, cfg) === 'out_of_stock') {
    return { ok: false, reason: 'parse', detail: 'no price shown (out of stock)', outOfStock: true }
  }
  return { ok: false, reason: 'parse', detail: 'no strategy produced a valid price' }
}
