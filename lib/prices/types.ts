export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

/** One way of finding the price on a page. Tried in order; the first valid price wins. */
export type Strategy =
  | { type: 'jsonld' }
  /** Selectors read the `content` attribute unless written as `selector@attr`. */
  | { type: 'meta'; selectors: string[] }
  /** Selectors read the element text unless written as `selector@attr`. */
  | { type: 'css'; selectors: string[] }
  /** Each pattern has one capture group, run over the raw HTML (embedded JSON state). */
  | { type: 'regex'; patterns: string[] }

export interface ApiConfig {
  /** `{id}` is replaced by the link's `apiId` (data/price-sources.json). */
  url: string
  /** Values may contain `${ENV_NAME}`; if any variable is unset the API step is skipped. */
  headers?: Record<string, string>
  /** Dotted path into the JSON response, e.g. `product.price.amount`. */
  pricePath: string
  inStockPath?: string
}

export interface ScraperConfig {
  /** Short key, also the file name (config/price-scrapers/<store>.json). */
  store: string
  /** Hostname suffixes this config handles (`amazon.in` matches `www.amazon.in`). */
  hosts: string[]
  requestHeaders?: Record<string, string>
  api?: ApiConfig
  strategies: Strategy[]
  availability?: {
    selectors: string[]
    outOfStockTexts?: string[]
    lowStockTexts?: string[]
  }
  /** Text that means "we were served a bot check, not the product page". */
  blockedTexts?: string[]
  minPrice?: number
  maxPrice?: number
  /** Offline regression checks: `npm run prices:test` runs each fixture through the strategies. */
  samples?: { fixture: string; expectedPrice: number; expectedStock?: StockStatus }[]
  notes?: string
}

export type FailureReason =
  | 'placeholder_url'
  | 'network'
  | 'http_error'
  | 'blocked'
  | 'parse'
  | 'currency'
  | 'outlier'

export type ExtractResult =
  | { ok: true; price: number; stock?: StockStatus; via: string }
  | { ok: false; reason: 'blocked' | 'parse' | 'currency'; detail?: string; outOfStock?: boolean }

export interface SnapshotEntry {
  price_inr: number
  stock_status?: StockStatus
  last_updated: string
  via: string
}

export interface PriceSnapshot {
  generated_at: string | null
  entries: Record<string, SnapshotEntry>
}

export interface LinkInput {
  id: string
  store_name: string
  affiliate_url: string
  price_inr: number | null
}

export interface SourceOverride {
  url?: string
  apiId?: string
}

export interface LinkResult {
  linkId: string
  storeKey: string
  url: string
  status: 'ok' | 'failed' | 'skipped'
  reason?: FailureReason
  detail?: string
  price?: number
  previous?: number | null
  via?: string
  /** Kept in memory only, so the CLI can save a fixture when a page stops parsing. */
  html?: string
}

export type StoreStatus = 'ok' | 'degraded' | 'blocked' | 'broken' | 'idle'

export interface StoreHealth {
  status: StoreStatus
  attempted: number
  ok: number
  failed: Partial<Record<FailureReason, number>>
  last_ok_at: string | null
  checked_at: string
  failures: { linkId: string; url: string; reason: FailureReason; detail?: string }[]
}

export interface HealthReport {
  generated_at: string | null
  stores: Record<string, StoreHealth>
}
