'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const PRESETS: Record<string, { label: string; min: number; max: number }[]> = {
  smartphones: [
    { label: 'Under ₹15K', min: 0, max: 15000 },
    { label: '₹15K–30K', min: 15000, max: 30000 },
    { label: '₹30K–60K', min: 30000, max: 60000 },
    { label: 'Flagship ₹60K+', min: 60000, max: 999999 },
  ],
  laptops: [
    { label: 'Under ₹40K', min: 0, max: 40000 },
    { label: '₹40K–80K', min: 40000, max: 80000 },
    { label: '₹80K–1.2L', min: 80000, max: 120000 },
    { label: 'Premium ₹1.2L+', min: 120000, max: 999999 },
  ],
  headphones: [
    { label: 'Under ₹5K', min: 0, max: 5000 },
    { label: '₹5K–15K', min: 5000, max: 15000 },
    { label: '₹15K–30K', min: 15000, max: 30000 },
    { label: 'Premium ₹30K+', min: 30000, max: 999999 },
  ],
  tablets: [
    { label: 'Under ₹25K', min: 0, max: 25000 },
    { label: '₹25K–50K', min: 25000, max: 50000 },
    { label: '₹50K+', min: 50000, max: 999999 },
  ],
}

const DEFAULT_PRESETS = [
  { label: 'Budget', min: 0, max: 20000 },
  { label: 'Mid-range', min: 20000, max: 60000 },
  { label: 'Premium', min: 60000, max: 999999 },
]

interface CategoryBudgetChipsProps {
  categorySlug: string
}

export function CategoryBudgetChips({ categorySlug }: CategoryBudgetChipsProps) {
  const sp = useSearchParams()
  const presets = PRESETS[categorySlug] ?? DEFAULT_PRESETS
  const activeMin = sp.get('minPrice')
  const activeMax = sp.get('maxPrice')

  function href(min: number, max: number) {
    const params = new URLSearchParams(sp.toString())
    if (activeMin === String(min) && activeMax === String(max)) {
      params.delete('minPrice')
      params.delete('maxPrice')
    } else {
      params.set('minPrice', String(min))
      params.set('maxPrice', String(max))
    }
    const qs = params.toString()
    return `/${categorySlug}${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="text-xs font-semibold text-muted self-center mr-1">Shop by budget:</span>
      {presets.map((p) => {
        const active = activeMin === String(p.min) && activeMax === String(p.max)
        return (
          <Link
            key={p.label}
            href={href(p.min, p.max)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'bg-primary text-white'
                : 'border border-border bg-surface text-primary hover:border-accent'
            }`}
          >
            {p.label}
          </Link>
        )
      })}
    </div>
  )
}
