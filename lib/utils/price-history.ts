export interface PricePoint {
  date: string
  price_inr: number
}

/** Mock 90-day price trail — CamelCamelCamel / Keepa style */
export function generatePriceHistory(params: {
  launchPrice: number | null
  currentPrice: number | null
  createdAt: string
}): PricePoint[] {
  const current = params.currentPrice
  if (current == null) return []

  const launch = params.launchPrice ?? Math.round(current * 1.12)
  const weeks = 12
  const startMs = new Date(params.createdAt).getTime()
  const now = Date.now()
  const span = Math.max(now - startMs, weeks * 7 * 86400000)

  const points: PricePoint[] = []

  for (let i = weeks; i >= 0; i--) {
    const progress = (weeks - i) / weeks
    const base = launch + (current - launch) * progress
    const wave = Math.sin(i * 1.4) * 0.018 + Math.cos(i * 0.75) * 0.012
    const price = Math.round(Math.max(current * 0.97, base * (1 + wave)))
    const ms = now - (i / weeks) * Math.min(span, 90 * 86400000)
    points.push({
      date: new Date(ms).toISOString().slice(0, 10),
      price_inr: price,
    })
  }

  return points
}

export function priceTrend(points: PricePoint[]): 'down' | 'up' | 'flat' {
  if (points.length < 2) return 'flat'
  const first = points[0].price_inr
  const last = points[points.length - 1].price_inr
  const diff = ((last - first) / first) * 100
  if (diff <= -2) return 'down'
  if (diff >= 2) return 'up'
  return 'flat'
}
