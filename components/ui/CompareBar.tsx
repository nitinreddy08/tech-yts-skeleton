'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { X, GitCompare } from 'lucide-react'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import type { ProductSummary } from '@/types'

interface CompareBarProps {
  products: ProductSummary[]
  onRemove: (id: string) => void
  onClear: () => void
  maxProducts?: number
}

export function CompareBar({ products, onRemove, onClear, maxProducts = 4 }: CompareBarProps) {
  const compareHref = buildCompareUrl(products.map((p) => p.slug))

  return (
    <AnimatePresence>
      {products.length >= 1 && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border shadow-lg px-4 py-3"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="mx-auto max-w-7xl flex items-center gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-muted">
              <GitCompare size={14} className="text-accent" />
              Compare ({products.length}/{maxProducts})
            </div>

            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface-alt px-2 py-1.5 shrink-0"
              >
                {product.thumbnail_url ? (
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src={product.thumbnail_url}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 shrink-0 bg-border rounded" />
                )}
                <span className="text-xs text-primary truncate max-w-[100px]">{product.name}</span>
                <button
                  type="button"
                  onClick={() => onRemove(product.id)}
                  className="text-muted hover:text-primary p-0.5"
                  aria-label={`Remove ${product.name} from compare`}
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}

            {products.length < maxProducts && (
              <Link
                href="/compare"
                className="shrink-0 text-xs text-accent hover:underline px-2"
              >
                + Add more
              </Link>
            )}

            <div className="ml-auto flex items-center gap-2 shrink-0">
              {products.length >= 2 ? (
                <Link
                  href={compareHref}
                  className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 whitespace-nowrap"
                >
                  Compare Now
                </Link>
              ) : (
                <span className="text-xs text-muted whitespace-nowrap">Add 1 more to compare</span>
              )}
              <button
                type="button"
                onClick={onClear}
                className="text-sm text-muted hover:text-primary px-2"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
