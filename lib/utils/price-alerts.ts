export const PRICE_ALERTS_KEY = 'techreviews-price-alerts'
export const MAX_PRICE_ALERTS = 15

export interface PriceAlert {
  productId: string
  productName: string
  slug: string
  categorySlug: string
  targetPriceInr: number
  setAt: string
}

export function loadPriceAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(PRICE_ALERTS_KEY) ?? '[]') as PriceAlert[]
  } catch {
    return []
  }
}

export function getPriceAlert(productId: string): PriceAlert | undefined {
  return loadPriceAlerts().find((a) => a.productId === productId)
}

export function setPriceAlert(alert: Omit<PriceAlert, 'setAt'>): PriceAlert {
  const current = loadPriceAlerts().filter((a) => a.productId !== alert.productId)
  const entry: PriceAlert = { ...alert, setAt: new Date().toISOString() }
  const next = [entry, ...current].slice(0, MAX_PRICE_ALERTS)
  localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('price-alerts-updated'))
  return entry
}

export function removePriceAlert(productId: string): void {
  const next = loadPriceAlerts().filter((a) => a.productId !== productId)
  localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('price-alerts-updated'))
}
