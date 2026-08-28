'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { loadPriceAlerts } from '@/lib/utils/price-alerts'

export function AlertsNavLink({ className = '' }: { className?: string }) {
  const pathname = usePathname()
  const [count, setCount] = useState(0)
  const active = pathname === '/alerts'

  useEffect(() => {
    const refresh = () => setCount(loadPriceAlerts().length)
    refresh()
    window.addEventListener('price-alerts-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('price-alerts-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return (
    <Link
      href="/alerts"
      className={`inline-flex items-center gap-1.5 transition-colors ${className} ${
        active ? 'text-accent' : 'text-muted hover:text-primary'
      }`}
      aria-label={count > 0 ? `Price alerts (${count})` : 'Price alerts'}
    >
      <Bell size={14} className={active ? 'fill-accent/20' : ''} />
      Alerts
      {count > 0 && (
        <span className="rounded-full bg-accent text-white px-1.5 py-0.5 text-[10px] font-bold min-w-[18px] text-center">
          {count}
        </span>
      )}
    </Link>
  )
}
