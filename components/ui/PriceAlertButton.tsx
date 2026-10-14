'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, BellRing, Check } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import {
  getPriceAlert,
  setPriceAlert,
  removePriceAlert,
} from '@/lib/utils/price-alerts'

interface PriceAlertButtonProps {
  productId: string
  productName: string
  slug: string
  categorySlug: string
  currentPrice: number | null
}

export function PriceAlertButton({
  productId,
  productName,
  slug,
  categorySlug,
  currentPrice,
}: PriceAlertButtonProps) {
  const [alert, setAlert] = useState<ReturnType<typeof getPriceAlert>>(undefined)
  const [justSet, setJustSet] = useState(false)

  useEffect(() => {
    const refresh = () => setAlert(getPriceAlert(productId))
    refresh()
    window.addEventListener('price-alerts-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('price-alerts-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [productId])

  if (currentPrice == null) return null

  function handleSet() {
    const entry = setPriceAlert({
      productId,
      productName,
      slug,
      categorySlug,
      targetPriceInr: currentPrice!,
    })
    setAlert(entry)
    setJustSet(true)
    setTimeout(() => setJustSet(false), 2500)
  }

  function handleRemove() {
    removePriceAlert(productId)
    setAlert(undefined)
  }

  if (alert) {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-start gap-3">
          <BellRing size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary">Price watch saved</p>
            <p className="text-xs text-muted mt-0.5">
              Watching for a price below{' '}
              <span className="font-bold text-accent">{formatIndianPrice(alert.targetPriceInr)}</span>.
              It&apos;s saved on this device — check{' '}
              <Link href="/my" className="font-medium text-accent underline underline-offset-2">My Stuff</Link>{' '}
              to see if it&apos;s been reached.
            </p>
            <button
              type="button"
              onClick={handleRemove}
              className="mt-1 inline-flex min-h-11 items-center text-xs font-medium text-muted underline hover:text-error-700"
            >
              Remove alert
            </button>
          </div>
          {justSet && <Check size={16} className="text-success-700 shrink-0" aria-hidden />}
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSet}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-alt px-4 py-3 text-sm font-semibold text-primary hover:border-accent hover:text-accent transition-colors"
    >
      <Bell size={16} aria-hidden />
      Watch this price (below {formatIndianPrice(currentPrice)})
    </button>
  )
}
