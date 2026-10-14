'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { formatIndianPrice } from '@/lib/utils/format'
import { loadPriceAlerts, removePriceAlert, type PriceAlert } from '@/lib/utils/price-alerts'

/** Price watches (this device). Rendered inside the My Stuff hub, which owns the page heading. */
export function PriceAlertsClient() {
  const [alerts, setAlerts] = useState<PriceAlert[] | null>(null)

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

  if (alerts === null) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading price watches">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-20 shimmer rounded-xl" />
        ))}
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        heading="No price watches yet"
        description="Tap “Watch this price” on any product page and it will be listed here, so you can come back and check it."
        action={{ label: 'Browse deals', href: '/deals' }}
      />
    )
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted" aria-live="polite">
        {alerts.length} price watch{alerts.length !== 1 ? 'es' : ''} on this device
      </p>

      <ul className="flex flex-col gap-3">
        {alerts.map((a) => (
          <li
            key={a.productId}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/30"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/${a.categorySlug}/${a.slug}`}
                className="line-clamp-2 text-sm font-semibold text-primary hover:text-accent"
              >
                {a.productName}
              </Link>
              <p className="mt-1 text-sm text-muted">
                Watching below{' '}
                <span className="font-bold text-accent">{formatIndianPrice(a.targetPriceInr)}</span>
                <span className="text-xs"> · set {new Date(a.setAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </p>
              <Link
                href={`/${a.categorySlug}/${a.slug}#buy-box`}
                className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline"
              >
                Check today&apos;s price →
              </Link>
            </div>
            <Button
              variant="secondary"
              size="auto"
              className="h-11 w-11 shrink-0 px-0"
              onClick={() => handleRemove(a.productId)}
              aria-label={`Remove price watch for ${a.productName}`}
            >
              <Trash2 size={16} aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-xs text-muted">
        Price watches are kept on this device only — we don&apos;t send emails or notifications. Open a product to see
        whether the price has reached your target.
      </p>
    </>
  )
}
