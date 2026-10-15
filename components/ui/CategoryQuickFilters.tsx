'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Chip } from '@/components/ui/Chip'
import { priceBandsFor } from '@/lib/constants/price-bands'
import type { CategoryTagCount } from '@/lib/data/category-tags'

interface CategoryQuickFiltersProps {
  categorySlug: string
  tags: CategoryTagCount[]
}

/**
 * One scrollable row of quick filters. Phones get the budget bands first (the
 * sidebar isn't there), then popular tags; desktop shows just the tags because
 * the sidebar already has the price bands.
 */
export function CategoryQuickFilters({ categorySlug, tags }: CategoryQuickFiltersProps) {
  const sp = useSearchParams()
  const bands = priceBandsFor(categorySlug)
  const activeMin = sp.get('minPrice')
  const activeMax = sp.get('maxPrice')

  function bandHref(min: number, max: number) {
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

  if (bands.length === 0 && tags.length === 0) return null

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 no-scrollbar lg:flex-wrap lg:overflow-visible">
      <div role="group" aria-label="Shop by budget" className="flex shrink-0 items-center gap-2 lg:hidden">
        {bands.map((p) => {
          const active = activeMin === String(p.min) && activeMax === String(p.max)
          return (
            <Chip key={p.label} href={bandHref(p.min, p.max)} scroll={false} active={active} aria-pressed={active} className="shrink-0">
              {p.label}
            </Chip>
          )
        })}
      </div>
      {tags.length > 0 && (
        <>
          <span className="h-5 w-px shrink-0 bg-border lg:hidden" aria-hidden />
          <div role="group" aria-label="Popular tags" className="flex shrink-0 items-center gap-2 lg:shrink lg:flex-wrap">
            {tags.slice(0, 6).map((tag) => (
              <Chip key={tag.slug} href={`/tag/${tag.slug}`} className="shrink-0 capitalize">
                #{tag.label}
              </Chip>
            ))}
            <Link href="/tags" className="inline-flex min-h-11 shrink-0 items-center px-2 text-sm font-semibold text-accent hover:underline">
              All tags →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
