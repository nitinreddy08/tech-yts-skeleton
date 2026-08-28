import Link from 'next/link'
import { GitCompare, ArrowRight } from 'lucide-react'
import { POPULAR_COMPARES } from '@/lib/constants/popular-compares'

interface CompareSuggestionsProps {
  compact?: boolean
  className?: string
}

export function CompareSuggestions({ compact = false, className = '' }: CompareSuggestionsProps) {
  return (
    <div className={className}>
      {!compact && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
          <GitCompare size={14} />
          Popular comparisons
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {POPULAR_COMPARES.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary hover:border-accent hover:text-accent transition-colors"
          >
            {label}
            <ArrowRight size={12} className="text-muted" />
          </Link>
        ))}
      </div>
    </div>
  )
}
