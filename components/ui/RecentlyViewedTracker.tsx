'use client'

import { useEffect } from 'react'
import { trackRecentlyViewed } from '@/lib/utils/recently-viewed'
import type { ProductSummary } from '@/types'

/** Tracks a PDP visit in localStorage — Amazon / Flipkart browsing history pattern. */
export function RecentlyViewedTracker({ product }: { product: ProductSummary }) {
  useEffect(() => {
    trackRecentlyViewed(product)
    window.dispatchEvent(new CustomEvent('recently-viewed-updated'))
  }, [product])

  return null
}
