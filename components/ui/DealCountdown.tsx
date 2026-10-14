'use client'

import { Clock } from 'lucide-react'
import { useNow } from '@/lib/hooks/useNow'

interface DealCountdownProps {
  expiresAt: string
  className?: string
  compact?: boolean
}

function split(diff: number) {
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { hours, minutes, seconds }
}

export function DealCountdown({ expiresAt, className = '', compact = false }: DealCountdownProps) {
  // Compact variants only show h/m, so they tick once a minute instead of every second.
  const now = useNow(compact ? 30000 : 1000)

  // Before mount we don't know the time: render a stable placeholder so the
  // server HTML and first client render agree.
  if (now === null) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium text-muted ${className}`}>
        <Clock size={12} aria-hidden /> Time left…
      </span>
    )
  }

  const diff = new Date(expiresAt).getTime() - now
  if (diff <= 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium text-muted ${className}`}>
        <Clock size={12} aria-hidden /> Deal ended
      </span>
    )
  }

  const { hours, minutes, seconds } = split(diff)
  const urgent = diff < 3600000
  const spoken = `${hours > 0 ? `${hours} hours ` : ''}${minutes} minutes left`

  if (compact) {
    return (
      <span
        role="timer"
        aria-label={spoken}
        className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${
          urgent ? 'text-error-700' : 'text-muted'
        } ${className}`}
      >
        <Clock size={12} aria-hidden />
        {urgent && <span>Ending soon ·</span>}
        <span aria-hidden>{hours}h {minutes}m left</span>
      </span>
    )
  }

  return (
    <div role="timer" aria-label={spoken} className={`flex items-center gap-2 ${className}`}>
      <Clock size={14} className={urgent ? 'text-error-700' : 'text-muted'} aria-hidden />
      {urgent && <span className="text-xs font-semibold text-error-700">Ending soon</span>}
      <div className="flex items-center gap-1.5 tabular-nums" aria-hidden>
        {[
          { v: hours, l: 'h' },
          { v: minutes, l: 'm' },
          { v: seconds, l: 's' },
        ].map(({ v, l }) => (
          <span
            key={l}
            className={`rounded-md px-2 py-1 text-sm font-bold ${
              urgent ? 'bg-error-50 text-error-700' : 'bg-surface-alt text-primary'
            }`}
          >
            {String(v).padStart(2, '0')}
            <span className="ml-0.5 text-xs font-normal">{l}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
