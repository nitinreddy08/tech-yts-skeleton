'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { Input } from '@/components/ui/Input'

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
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands…"
          className="rounded-full pl-10"
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
      <p role="status" className={filtered.length === 0 ? 'py-12 text-center text-sm text-muted' : 'sr-only'}>
        {filtered.length === 0
          ? <>No brands match &ldquo;{query}&rdquo;.</>
          : `${filtered.length} brand${filtered.length !== 1 ? 's' : ''} shown`}
      </p>
    </>
  )
}
