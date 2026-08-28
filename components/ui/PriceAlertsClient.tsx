'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Trash2, Package } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatIndianPrice } from '@/lib/utils/format'
import { loadPriceAlerts, removePriceAlert, type PriceAlert } from '@/lib/utils/price-alerts'

export function PriceAlertsClient({ embedded = false }: { embedded?: boolean }) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])

  useEffect(() => {
    const refresh = () => setAlerts(loadPriceAlerts())
    refresh()
    window.addEventListener('price-alerts-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('price-alerts-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  function handleRemove(productId: string) {
    removePriceAlert(productId)
    setAlerts(loadPriceAlerts())
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        heading="No price alerts yet"
        description="Set an alert on any product page — we'll show your target price here when you're tracking a deal."
        action={{ label: 'Browse Deals', href: '/deals' }}
      />
    )
  }

  return (
    <>
      {!embedded && (
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-2">
          <Bell size={28} className="text-accent" />
          Price Alerts
        </h1>
        <p className="text-muted mt-2">
          {alerts.length} active alert{alerts.length !== 1 ? 's' : ''} on this device
        </p>
      </div>
      )}

      <div className="flex flex-col gap-3">
        {alerts.map((a) => (
          <div
            key={a.productId}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 hover:border-accent/30 transition-colors"
          >
            <Link
              href={`/${a.categorySlug}/${a.slug}`}
              className="relative h-16 w-16 shrink-0 rounded-lg bg-surface-alt border border-border overflow-hidden"
            >
              <div className="flex h-full items-center justify-center">
                <Package size={24} className="text-muted/30" />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/${a.categorySlug}/${a.slug}`}
                className="text-sm font-semibold text-primary hover:text-accent line-clamp-2"
              >
                {a.productName}
              </Link>
              <p className="text-xs text-muted mt-1">
                Alert below{' '}
                <span className="font-bold text-accent">{formatIndianPrice(a.targetPriceInr)}</span>
              </p>
              <p className="text-[10px] text-muted mt-0.5">
                Set {new Date(a.setAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(a.productId)}
              className="shrink-0 rounded-lg border border-border p-2 text-muted hover:text-red-600 hover:border-red-200 transition-colors"
              aria-label="Remove alert"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Alerts are stored locally. In production, email notifications would fire when prices drop.
      </p>
    </>
  )
}
