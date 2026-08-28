import { cn } from '@/lib/utils/cn'
import { categoryTextClass } from '@/lib/utils/category-colors'

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'category'
  /** Required when tone="category" — selects the per-category accent. */
  category?: string
}

export function Eyebrow({ tone = 'neutral', category, className = '', children, ...props }: EyebrowProps) {
  return (
    <span
      className={cn(
        'text-xs font-medium uppercase tracking-wide',
        tone === 'category' ? categoryTextClass(category) : 'text-muted',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
