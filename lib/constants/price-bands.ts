import { formatIndianPrice } from '@/lib/utils/format'

export interface PriceBand {
  label: string
  min: number
  max: number
}

/** Open-ended upper bound used by the top band (matches the existing `maxPrice` URL values). */
export const PRICE_CEILING = 999999

/**
 * One source of price bands per category. Both the "Shop by budget" chips and
 * the sidebar/drawer price filter read from here, so a selection made in
 * either place shows as active in both. Bands are tuned to each category's
 * real price spread — a flat ₹20K/50K/80K ladder is useless for headphones.
 */
const BANDS: Record<string, PriceBand[]> = {
  smartphones: [
    { label: 'Under ₹15K', min: 0, max: 15000 },
    { label: '₹15K–30K', min: 15000, max: 30000 },
    { label: '₹30K–60K', min: 30000, max: 60000 },
    { label: 'Flagship ₹60K+', min: 60000, max: PRICE_CEILING },
  ],
  laptops: [
    { label: 'Under ₹40K', min: 0, max: 40000 },
    { label: '₹40K–80K', min: 40000, max: 80000 },
    { label: '₹80K–1.2L', min: 80000, max: 120000 },
    { label: 'Premium ₹1.2L+', min: 120000, max: PRICE_CEILING },
  ],
  headphones: [
    { label: 'Under ₹5K', min: 0, max: 5000 },
    { label: '₹5K–15K', min: 5000, max: 15000 },
    { label: '₹15K–30K', min: 15000, max: 30000 },
    { label: 'Premium ₹30K+', min: 30000, max: PRICE_CEILING },
  ],
  tablets: [
    { label: 'Under ₹25K', min: 0, max: 25000 },
    { label: '₹25K–50K', min: 25000, max: 50000 },
    { label: '₹50K+', min: 50000, max: PRICE_CEILING },
  ],
}

const DEFAULT_BANDS: PriceBand[] = [
  { label: 'Budget', min: 0, max: 20000 },
  { label: 'Mid-range', min: 20000, max: 60000 },
  { label: 'Premium', min: 60000, max: PRICE_CEILING },
]

export function priceBandsFor(categorySlug: string): PriceBand[] {
  return BANDS[categorySlug] ?? DEFAULT_BANDS
}

/** Human label for any min/max pair — a preset's label when it matches one, otherwise "₹X–₹Y". */
export function priceRangeLabel(categorySlug: string, min: number | null, max: number | null): string {
  const band = priceBandsFor(categorySlug).find((b) => b.min === min && b.max === max)
  if (band) return band.label
  const lo = min ?? 0
  if (max == null || max >= PRICE_CEILING) return `${formatIndianPrice(lo)}+`
  if (!lo) return `Under ${formatIndianPrice(max)}`
  return `${formatIndianPrice(lo)}–${formatIndianPrice(max)}`
}
