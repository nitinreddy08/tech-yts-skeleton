'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface DealCountdownProps {
  expiresAt: string
  className?: string
  compact?: boolean
}

function getRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { hours, minutes, seconds, total: diff }
}

export function DealCountdown({ expiresAt, className = '', compact = false }: DealCountdownProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt))

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(expiresAt))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!remaining) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium text-muted ${className}`}>
        <Clock size={12} /> Expired
      </span>
    )
  }

  const urgent = remaining.total < 3600000

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${
          urgent ? 'text-red-600' : 'text-muted'
        } ${className}`}
      >
        <Clock size={12} />
        {remaining.hours}h {remaining.minutes}m left
      </span>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock size={14} className={urgent ? 'text-red-600' : 'text-muted'} />
      <div className="flex items-center gap-1.5 tabular-nums">
        {[
          { v: remaining.hours, l: 'h' },
          { v: remaining.minutes, l: 'm' },
          { v: remaining.seconds, l: 's' },
        ].map(({ v, l }) => (
          <span
            key={l}
            className={`rounded-md px-2 py-1 text-sm font-bold ${
              urgent ? 'bg-red-50 text-red-700' : 'bg-surface-alt text-primary'
            }`}
          >
            {String(v).padStart(2, '0')}
            <span className="text-[10px] font-normal ml-0.5">{l}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
