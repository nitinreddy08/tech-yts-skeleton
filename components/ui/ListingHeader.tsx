import { cn } from '@/lib/utils/cn'

interface ListingHeaderProps {
  title: React.ReactNode
  subtitle?: string
  /** Total shown next to the title on tablets and up (phones show it in their sticky toolbar). */
  count?: number
  countLabel?: string
  /** Something to the left of the title (logo, icon). */
  lead?: React.ReactNode
  /** Controls on the right (sort, etc). */
  actions?: React.ReactNode
  className?: string
}

/**
 * The one header every listing page shares: a slim title row — no grey box.
 * Title (+ optional one-line subtitle) on the left, count and controls on the right.
 */
export function ListingHeader({ title, subtitle, count, countLabel = 'products', lead, actions, className }: ListingHeaderProps) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 md:mb-6', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {lead}
        <div className="min-w-0">
          <h1 className="text-h1 text-primary">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {(count != null || actions) && (
        <div className="flex items-center gap-3">
          {count != null && (
            <p className="hidden text-sm text-muted sm:block">
              <span className="font-semibold text-primary">{count}</span> {count === 1 ? countLabel.replace(/s$/, '') : countLabel}
            </p>
          )}
          {actions}
        </div>
      )}
    </div>
  )
}
