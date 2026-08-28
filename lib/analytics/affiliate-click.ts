'use client'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackAffiliateClick(params: {
  linkId: string
  storeName: string
  productName?: string
  priceInr?: number | null
}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'affiliate_click', {
    link_id: params.linkId,
    store_name: params.storeName,
    product_name: params.productName ?? '',
    value: params.priceInr ?? undefined,
    currency: 'INR',
  })
}
