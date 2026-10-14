import { cn } from '@/lib/utils/cn'
import { scoreFillClass, scoreVerdict } from '@/lib/utils/score'

interface RatingBadgeProps {
  score: number
  /** Show the verdict word ("Very Good") next to the number. */
  showVerdict?: boolean
  className?: string
}

/**
 * The compact creator-score treatment used on every product card and result
 * row (the big ScoreRing is reserved for the product page). Colour follows the
 * same bands as the ring, so a score looks the same wherever it appears.
 */
export function RatingBadge({ score, showVerdict = false, className }: RatingBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs text-muted', className)}>
      <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 font-bold text-white tabular-nums', scoreFillClass(score))}>
        {score.toFixed(1)}
      </span>
      <span>
        <span className="sr-only">Creator rating {score.toFixed(1)} out of 10, {scoreVerdict(score)}. </span>
        <span aria-hidden>{showVerdict ? scoreVerdict(score) : '/10'}</span>
      </span>
    </span>
  )
}
