'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'

interface BrandItem {
  id: string
  name: string
  slug: string
  productCount: number
}

export function BrandsSearchGrid({ brands }: { brands: BrandItem[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return brands
    return brands.filter((b) => b.name.toLowerCase().includes(q) || b.slug.includes(q))
  }, [brands, query])

  return (
    <>
      <div className="relative max-w-md mx-auto mb-10">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands..."
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm focus:border-accent outline-none"
          aria-label="Search brands"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((brand) => (
          <Link
            key={brand.id}
            href={`/brand/${brand.slug}`}
            className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-6 hover:border-accent hover:shadow-md transition-all text-center"
          >
            <BrandLogo name={brand.name} size="lg" />
            <span className="font-heading text-base font-bold text-primary group-hover:text-accent transition-colors">
              {brand.name}
            </span>
            <span className="text-xs text-muted">
              {brand.productCount} product{brand.productCount !== 1 ? 's' : ''}
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted py-12">No brands match &ldquo;{query}&rdquo;</p>
      )}
    </>
  )
}
