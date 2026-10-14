'use client'

import { useSearchParams } from 'next/navigation'
import { Chip } from '@/components/ui/Chip'
import { priceBandsFor } from '@/lib/constants/price-bands'

interface CategoryBudgetChipsProps {
  categorySlug: string
}

/** One-tap budget bands. Shares its bands (and URL state) with the sidebar/drawer price filter. */
export function CategoryBudgetChips({ categorySlug }: CategoryBudgetChipsProps) {
  const sp = useSearchParams()
  const presets = priceBandsFor(categorySlug)
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
    <div role="group" aria-label="Shop by budget" className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-xs font-semibold text-muted mr-1">Shop by budget:</span>
      {presets.map((p) => {
        const active = activeMin === String(p.min) && activeMax === String(p.max)
        return (
          <Chip key={p.label} href={href(p.min, p.max)} scroll={false} active={active} aria-pressed={active}>
            {p.label}
          </Chip>
        )
      })}
    </div>
  )
}
