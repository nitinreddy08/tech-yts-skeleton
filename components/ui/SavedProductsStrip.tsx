'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bookmark, Package } from 'lucide-react'
import { loadWishlist } from '@/lib/utils/wishlist'
import { formatIndianPrice } from '@/lib/utils/format'
import type { ProductSummary } from '@/types'

export function SavedProductsStrip() {
  const [items, setItems] = useState<ProductSummary[]>([])

  useEffect(() => {
    const refresh = () => setItems(loadWishlist())
    refresh()
    window.addEventListener('wishlist-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('wishlist-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <section className="py-12 px-4 border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold text-primary flex items-center gap-2">
            <Bookmark size={20} className="text-accent fill-accent/20" /> Saved for Later
          </h2>
          <Link href="/saved" className="text-xs font-semibold text-accent hover:underline shrink-0">
            View all →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/${p.category_slug}/${p.slug}`}
              className="shrink-0 w-36 rounded-xl border border-border bg-surface-alt p-3 hover:border-accent transition-colors"
            >
              <div className="relative aspect-square rounded-lg bg-surface border border-border mb-2 overflow-hidden">
                {p.thumbnail_url ? (
                  <Image src={p.thumbnail_url} alt={p.name} fill sizes="144px" className="object-contain p-2" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Package size={24} className="text-muted/30" /></div>
                )}
              </div>
              <p className="text-xs font-semibold text-primary line-clamp-2">{p.name}</p>
              {p.current_price_inr != null && (
                <p className="text-xs font-bold text-accent mt-1">{formatIndianPrice(p.current_price_inr)}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
