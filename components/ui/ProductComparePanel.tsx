'use client'

import Link from 'next/link'
import { GitCompare, Check, Plus } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import { useCompare } from '@/components/providers/CompareProvider'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import type { ProductSummary } from '@/types'

interface SimilarCompareStripProps {
  current: ProductSummary
  similar: ProductSummary[]
}

/** One compact line: tap a chip to add that rival to the compare tray, or open the comparison. */
export function SimilarCompareStrip({ current, similar }: SimilarCompareStripProps) {
  const { toggleProduct, isInCompare } = useCompare()
  const rivals = similar.slice(0, 3)
  if (rivals.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
        <GitCompare size={16} className="text-accent" aria-hidden /> Compare with
      </span>
      {rivals.map((s) => {
        const added = isInCompare(s.id)
        return (
          <Chip key={s.id} size="md" active={added} onClick={() => toggleProduct(s)} aria-pressed={added}>
            {added ? <Check size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
            {s.name.split(' ').slice(0, 3).join(' ')}
          </Chip>
        )
      })}
      <Link
        href={buildCompareUrl([current.slug, ...rivals.map((s) => s.slug)])}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline"
      >
        See side by side →
      </Link>
    </div>
  )
}
