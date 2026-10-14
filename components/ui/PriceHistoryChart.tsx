import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatIndianPrice } from '@/lib/utils/format'
import { priceTrend, type PricePoint } from '@/lib/utils/price-history'

interface PriceHistoryChartProps {
  points: PricePoint[]
  productName: string
}

export function PriceHistoryChart({ points, productName }: PriceHistoryChartProps) {
  if (points.length < 2) return null

  const prices = points.map((p) => p.price_inr)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const trend = priceTrend(points)
  const latest = points[points.length - 1].price_inr
  const oldest = points[0].price_inr
  const changePct = Math.round(((latest - oldest) / oldest) * 100)

  const width = 320
  const height = 80
  const pad = 4

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (p.price_inr - min) / range) * (height - pad * 2)
    return `${x},${y}`
  })

  const linePath = `M ${coords.join(' L ')}`
  const areaPath = `${linePath} L ${width - pad},${height - pad} L ${pad},${height - pad} Z`

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-primary">
            Price trend
            <Badge variant="neutral" size="sm">Illustrative</Badge>
          </h2>
          <p className="text-xs text-muted mt-0.5">Estimated path from launch price to today — {productName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent">{formatIndianPrice(latest)}</p>
          <p
            className={`text-xs font-semibold flex items-center justify-end gap-1 ${
              trend === 'down' ? 'text-success-700' : trend === 'up' ? 'text-error-700' : 'text-muted'
            }`}
          >
            {trend === 'down' && <TrendingDown size={12} />}
            {trend === 'up' && <TrendingUp size={12} />}
            {trend === 'flat' && <Minus size={12} />}
            {changePct > 0 ? '+' : ''}
            {changePct}% since launch
          </p>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-20"
          role="img"
          aria-label={`Price chart from ${formatIndianPrice(oldest)} to ${formatIndianPrice(latest)}`}
        >
          <defs>
            <linearGradient id="price-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#price-fill)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>Low {formatIndianPrice(min)}</span>
          <span>High {formatIndianPrice(max)}</span>
        </div>
      </div>

      <p className="text-xs text-muted mt-3">
        Modelled from the launch and current price — not a record of daily store prices. For today&apos;s
        real price, check the stores above.
      </p>
    </section>
  )
}
