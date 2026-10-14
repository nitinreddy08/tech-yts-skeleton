'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useBottomLayer } from '@/lib/hooks/useBottomLayer'
import { buildCompareUrl } from '@/lib/utils/compare-url'
import type { ProductSummary } from '@/types'

interface CompareBarProps {
  products: ProductSummary[]
  onRemove: (id: string) => void
  onClear: () => void
  maxProducts?: number
}

export function CompareBar({ products, onRemove, onClear, maxProducts = 4 }: CompareBarProps) {
  const pathname = usePathname()
  const show = products.length >= 1 && !(pathname ?? '').startsWith('/admin')
  const barRef = useBottomLayer<HTMLDivElement>('compare', show)
  const compareHref = buildCompareUrl(products.map((p) => p.slug))

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={barRef}
          role="region"
          aria-label="Compare tray"
          data-compare-bar
          className="fixed inset-x-0 bottom-[var(--layer-tabbar)] z-40 bg-surface border-t border-border shadow-lg px-4 py-2"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            {/* Products scroll on their own; the actions on the right never do,
                so "Compare Now" can't slide out of view on a phone. */}
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-muted">
                <GitCompare size={14} className="text-accent" aria-hidden />
                <span className="hidden sm:inline">Compare</span> ({products.length}/{maxProducts})
              </div>

              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface-alt pl-2 shrink-0"
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
                    className="flex h-11 w-9 items-center justify-center text-muted hover:text-primary"
                    aria-label={`Remove ${product.name} from compare`}
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}

              {products.length < maxProducts && (
                <Link
                  href="/compare"
                  className="shrink-0 inline-flex min-h-11 items-center px-2 text-xs font-medium text-accent hover:underline"
                >
                  + Add more
                </Link>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {products.length >= 2 ? (
                <Button href={compareHref} size="auto" className="h-11 px-4 text-sm whitespace-nowrap">
                  Compare Now
                </Button>
              ) : (
                <span className="hidden text-xs text-muted whitespace-nowrap sm:inline">Add 1 more to compare</span>
              )}
              <button
                type="button"
                onClick={onClear}
                className="inline-flex min-h-11 items-center px-3 text-sm text-muted hover:text-primary"
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
