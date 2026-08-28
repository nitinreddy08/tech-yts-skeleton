import Link from 'next/link'
import { GitCompare, ArrowRight } from 'lucide-react'
import { POPULAR_COMPARES } from '@/lib/constants/popular-compares'

export function QuickCompareStrip() {
  return (
    <section className="py-10 px-4 bg-surface-alt">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare size={20} className="text-accent" />
          <h2 className="font-heading text-lg font-bold text-primary">Popular Comparisons</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_COMPARES.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
            >
              {label}
              <ArrowRight size={14} className="text-muted" />
            </Link>
          ))}
          <Link
            href="/compare"
            className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
          >
            Compare any product
          </Link>
        </div>
      </div>
    </section>
  )
}
