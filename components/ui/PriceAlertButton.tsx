'use client'

import { useEffect, useState } from 'react'
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
            <p className="text-sm font-semibold text-primary">Price alert active</p>
            <p className="text-xs text-muted mt-0.5">
              We&apos;ll notify you when price drops below{' '}
              <span className="font-bold text-accent">{formatIndianPrice(alert.targetPriceInr)}</span>
            </p>
            <button
              type="button"
              onClick={handleRemove}
              className="mt-2 text-xs font-medium text-muted hover:text-red-600 underline"
            >
              Remove alert
            </button>
          </div>
          {justSet && <Check size={16} className="text-green-600 shrink-0" />}
        </div>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSet}
      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-alt px-4 py-3 text-sm font-semibold text-primary hover:border-accent hover:text-accent transition-colors"
    >
      <Bell size={16} />
      Alert me when price drops below {formatIndianPrice(currentPrice)}
    </button>
  )
}
