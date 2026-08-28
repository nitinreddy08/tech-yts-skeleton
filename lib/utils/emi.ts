import { formatIndianPrice } from '@/lib/utils/format'

/** Flipkart/Amazon-style no-cost EMI estimate (mock — 6/9/12 mo). */
export function estimateEmi(priceInr: number, months = 6): number {
  return Math.ceil(priceInr / months)
}

export function formatEmiLine(priceInr: number, months = 6, noCost = true): string {
  const emi = estimateEmi(priceInr, months)
  return noCost
    ? `No-cost EMI from ${formatIndianPrice(emi)}/mo`
    : `EMI from ${formatIndianPrice(emi)}/mo`
}
