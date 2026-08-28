import { Clock } from 'lucide-react'

interface ReviewUpdatedBadgeProps {
  updatedAt: string
  className?: string
}

export function ReviewUpdatedBadge({ updatedAt, className = '' }: ReviewUpdatedBadgeProps) {
  const formatted = new Date(updatedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <p className={`inline-flex items-center gap-1.5 text-xs text-muted ${className}`}>
      <Clock size={12} className="shrink-0" />
      Review updated {formatted}
    </p>
  )
}
