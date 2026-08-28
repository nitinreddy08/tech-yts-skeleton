import { cn } from '@/lib/utils/cn'

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

/** Category slugs this app currently ships, plus a few reserved for
 *  categories not live yet — keeps the map future-proof without a
 *  hardcoded fallback color that would silently mismatch new categories.
 *  Tint/ink pairs come from the category-* tokens in app/globals.css. */
const CATEGORY_COLORS: Record<string, string> = {
  smartphones: 'bg-category-smartphones-tint text-primary-700',
  laptops: 'bg-category-laptops-tint text-[color:var(--category-laptops)]',
  headphones: 'bg-category-headphones-tint text-[color:var(--category-headphones)]',
  tablets: 'bg-category-tablets-tint text-[color:var(--category-tablets)]',
  wearables: 'bg-category-wearables-tint text-[color:var(--category-wearables)]',
  gaming: 'bg-category-gaming-tint text-[color:var(--category-gaming)]',
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
  const variantClass =
    variant === 'category'
      ? (category && CATEGORY_COLORS[category]) || 'bg-neutral-100 text-secondary'
      : VARIANT_CLASSES[variant]
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
