import { formatIndianPrice } from '@/lib/utils/format'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

interface PriceProps {
  value: number | null | undefined
  /** Higher "was" price: shown struck through, and drives the discount chip. */
  original?: number | null
  /** Show a "−7%" chip when `original` is higher than `value`. */
  showDiscount?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = { sm: 'text-base', md: 'text-lg', lg: 'text-3xl' } as const

/**
 * The one way a price is drawn. The current price is ink (not brand violet) so
 * the violet primary button is the loudest thing on screen; savings are green.
 */
export function Price({ value, original, showDiscount = false, size = 'md', className }: PriceProps) {
  if (value == null) return <span className={cn('text-sm text-muted', className)}>Price unavailable</span>
  const pct = original && original > value ? Math.round(((original - value) / original) * 100) : null

  return (
    <span className={cn('inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5', className)}>
      <span className={cn('font-extrabold tabular-nums text-primary', SIZES[size])}>{formatIndianPrice(value)}</span>
      {pct != null && (
        <>
          <span className="text-sm text-muted line-through tabular-nums">
            <span className="sr-only">Was </span>
            {formatIndianPrice(original!)}
          </span>
          {showDiscount && (
            <Badge variant="success" size="sm">
              {pct}% off
            </Badge>
          )}
        </>
      )}
    </span>
  )
}
