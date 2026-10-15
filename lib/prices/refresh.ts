import { extractFromHtml } from './extract'
import { buildApiRequest, readApiResponse } from './api'
import { buildHealthReport } from './health'
import { isPlausibleChange } from './validate'
import type {
  HealthReport,
  LinkInput,
  LinkResult,
  PriceSnapshot,
  ScraperConfig,
  SourceOverride,
  StockStatus,
} from './types'

export interface RefreshDeps {
  fetchPage(url: string, headers: Record<string, string>): Promise<{ status: number; html: string }>
  fetchJson(url: string, headers: Record<string, string>): Promise<{ status: number; json: unknown }>
  env: Record<string, string | undefined>
  now(): Date
  sleep(ms: number): Promise<void>
}

export interface RefreshOptions {
  links: LinkInput[]
  sources: Record<string, SourceOverride>
  configs: ScraperConfig[]
  previous: PriceSnapshot
  previousHealth: HealthReport
  deps: RefreshDeps
  /** Pause between requests to the same host. */
  delayMs?: number
  /** Links that failed for a transient reason (network / HTTP error / blocked) get one more try after this pause. */
  retryDelayMs?: number
  onlyStore?: string
  /** Accept prices that jump outside the believable range (use after a real repricing). */
  acceptOutliers?: boolean
  onProgress?: (r: LinkResult) => void
}

const PLACEHOLDER = /mock|example\.com|localhost/i

export function configFor(url: string, configs: ScraperConfig[]): ScraperConfig {
  let host = ''
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    /* falls through to generic */
  }
  return (
    configs.find((c) => c.store !== 'generic' && c.hosts.some((h) => host === h || host.endsWith(`.${h}`))) ??
    configs.find((c) => c.store === 'generic') ??
    { store: 'generic', hosts: [], strategies: [{ type: 'jsonld' }] }
  )
}

const DEFAULT_HEADERS: Record<string, string> = {
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml',
  'accept-language': 'en-IN,en;q=0.9',
}

async function refreshOne(link: LinkInput, opts: RefreshOptions): Promise<{ result: LinkResult; stock?: StockStatus }> {
  const src = opts.sources[link.id] ?? {}
  const url = src.url ?? link.affiliate_url
  const cfg = configFor(url, opts.configs)
  const base = { linkId: link.id, storeKey: cfg.store, url, previous: opts.previous.entries[link.id]?.price_inr ?? link.price_inr }
  const fail = (reason: LinkResult['reason'], detail?: string, html?: string) =>
    ({ result: { ...base, status: 'failed', reason, detail, html } as LinkResult })

  if (PLACEHOLDER.test(url)) {
    return { result: { ...base, status: 'skipped', reason: 'placeholder_url', detail: 'set a real product URL on the affiliate link or in data/price-sources.json' } }
  }

  let price: number | undefined
  let stock: StockStatus | undefined
  let via = ''

  // 1. Official / JSON API, when configured and credentials exist.
  if (cfg.api && src.apiId) {
    const req = buildApiRequest(cfg.api, src.apiId, opts.deps.env)
    if (req) {
      try {
        const res = await opts.deps.fetchJson(req.url, req.headers)
        const read = res.status < 400 ? readApiResponse(cfg.api, res.json) : null
        if (read) {
          price = read.price
          stock = read.stock
          via = 'api'
        }
      } catch {
        /* fall through to the page */
      }
    }
  }

  // 2. The product page.
  if (price == null) {
    let page: { status: number; html: string }
    try {
      page = await opts.deps.fetchPage(url, { ...DEFAULT_HEADERS, ...cfg.requestHeaders })
    } catch (e) {
      return fail('network', e instanceof Error ? e.message : String(e))
    }
    if ([403, 429, 503].includes(page.status)) return fail('blocked', `HTTP ${page.status}`)
    if (page.status >= 400) return fail('http_error', `HTTP ${page.status}`)

    const out = extractFromHtml(page.html, cfg)
    if (!out.ok && out.outOfStock && base.previous != null) {
      return { result: { ...base, status: 'ok', price: base.previous, via: 'availability' }, stock: 'out_of_stock' }
    }
    if (!out.ok) return fail(out.reason, out.detail, out.reason === 'parse' ? page.html : undefined)
    price = out.price
    stock = out.stock
    via = out.via
  }

  if (!opts.acceptOutliers && !isPlausibleChange(price, base.previous)) {
    return fail('outlier', `₹${price} vs last known ₹${base.previous} (via ${via}) — likely the wrong element`)
  }
  return { result: { ...base, status: 'ok', price, via }, stock }
}

/**
 * Refreshes every link that has a real URL. Hosts run in parallel, requests to one
 * host run one after another with a pause. A link that fails keeps its previous
 * snapshot entry — a bad run never wipes good prices.
 */
export async function refreshPrices(opts: RefreshOptions): Promise<{
  snapshot: PriceSnapshot
  results: LinkResult[]
  health: HealthReport
}> {
  const nowIso = opts.deps.now().toISOString()
  const entries = { ...opts.previous.entries }
  const results: LinkResult[] = []

  const groups = new Map<string, LinkInput[]>()
  for (const link of opts.links) {
    const url = opts.sources[link.id]?.url ?? link.affiliate_url
    const cfg = configFor(url, opts.configs)
    if (opts.onlyStore && cfg.store !== opts.onlyStore) continue
    let host = url
    try {
      host = new URL(url).hostname
    } catch {
      /* keep raw */
    }
    groups.set(host, [...(groups.get(host) ?? []), link])
  }

  const record = (link: LinkInput, result: LinkResult, stock?: StockStatus) => {
    results.push(result)
    if (result.status === 'ok' && result.price != null) {
      entries[link.id] = {
        price_inr: result.price,
        ...(stock ? { stock_status: stock } : {}),
        last_updated: nowIso,
        via: result.via ?? '',
      }
    }
    opts.onProgress?.(result)
  }
  const transient = (r: LinkResult) =>
    r.status === 'failed' && (r.reason === 'network' || r.reason === 'http_error' || r.reason === 'blocked')

  await Promise.all(
    [...groups.values()].map(async (links) => {
      const retryLater: LinkInput[] = []
      for (const [i, link] of links.entries()) {
        const { result, stock } = await refreshOne(link, opts)
        if (transient(result) && opts.retryDelayMs != null) retryLater.push(link)
        else record(link, result, stock)
        if (i < links.length - 1 && result.status !== 'skipped') await opts.deps.sleep(opts.delayMs ?? 2500)
      }
      // Second chance for blips (a reset connection, a 503, a one-off bot check): wait, then try once more.
      if (retryLater.length > 0) {
        await opts.deps.sleep(opts.retryDelayMs ?? 0)
        for (const [i, link] of retryLater.entries()) {
          const { result, stock } = await refreshOne(link, opts)
          record(link, result, stock)
          if (i < retryLater.length - 1) await opts.deps.sleep(opts.delayMs ?? 2500)
        }
      }
    })
  )

  return {
    snapshot: { generated_at: nowIso, entries },
    results,
    health: buildHealthReport(results, opts.previousHealth, nowIso),
  }
}
