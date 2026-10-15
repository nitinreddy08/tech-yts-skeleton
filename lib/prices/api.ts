import { getPath, parsePrice } from './parse'
import type { ApiConfig, StockStatus } from './types'

/** Replaces `${NAME}` with env values; returns null if any variable is unset. */
export function resolveHeaders(
  headers: Record<string, string> | undefined,
  env: Record<string, string | undefined>
): Record<string, string> | null {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers ?? {})) {
    let missing = false
    out[k] = v.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name: string) => {
      const val = env[name]
      if (!val) missing = true
      return val ?? ''
    })
    if (missing) return null
  }
  return out
}

export function buildApiRequest(
  api: ApiConfig,
  apiId: string,
  env: Record<string, string | undefined>
): { url: string; headers: Record<string, string> } | null {
  const headers = resolveHeaders(api.headers, env)
  if (!headers) return null
  return { url: api.url.replace('{id}', encodeURIComponent(apiId)), headers }
}

export function readApiResponse(
  api: ApiConfig,
  json: unknown
): { price: number; stock?: StockStatus } | null {
  const price = parsePrice(getPath(json, api.pricePath) as string | number | undefined)
  if (price == null) return null
  let stock: StockStatus | undefined
  if (api.inStockPath) {
    const v = getPath(json, api.inStockPath)
    if (v === false || v === 'false') stock = 'out_of_stock'
    else if (v === true || v === 'true') stock = 'in_stock'
  }
  return { price, stock }
}
