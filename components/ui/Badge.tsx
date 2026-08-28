import { cn } from '@/lib/utils/cn'
import { categoryBadgeClasses } from '@/lib/utils/category-colors'

export type BadgeVariant = 'neutral' | 'accent' | 'discount' | 'deal' | 'success' | 'warning' | 'error' | 'category'
export type BadgeSize = 'sm' | 'md'

const BASE = 'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap'

const VARIANT_CLASSES: Record<Exclude<BadgeVariant, 'category'>, string> = {
  neutral: 'bg-neutral-100 text-muted',
  // Brand-forward label (editorial "Top 10", rank badges) — distinct from
  // "deal", which stays reserved for actual time-limited price promotions.
  accent: 'bg-accent text-white font-semibold',
  discount: 'bg-error-100 text-error-700',
  deal: 'bg-secondary text-primary font-semibold',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  error: 'bg-error-100 text-error-700',
}

const SIZE_CLASSES: Record<BadgeSize, string> = {
  md: 'h-6 px-2.5 text-sm',
  sm: 'h-5 px-2 text-xs',
}

export function badgeVariants({
  variant = 'neutral',
  size = 'md',
  category,
  className = '',
}: {
  variant?: BadgeVariant
  size?: BadgeSize
  category?: string
  className?: string
} = {}): string {
  const variantClass = variant === 'category' ? categoryBadgeClasses(category) : VARIANT_CLASSES[variant]
  return cn(BASE, variantClass, SIZE_CLASSES[size], className)
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  /** Required when variant="category" — selects the per-category accent. */
  category?: string
}

export function Badge({ variant = 'neutral', size = 'md', category, className = '', children, ...props }: BadgeProps) {
  return (
    <span className={badgeVariants({ variant, size, category, className })} {...props}>
      {children}
    </span>
  )
}
