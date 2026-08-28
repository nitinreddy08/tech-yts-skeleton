import Link from 'next/link'
import { GitCompare } from 'lucide-react'
import type { FrequentCompare } from '@/lib/data/frequent-compares'

interface FrequentComparesStripProps {
  productName: string
  pairs: FrequentCompare[]
}

export function FrequentComparesStrip({ productName, pairs }: FrequentComparesStripProps) {
  if (pairs.length === 0) return null

  return (
    <section className="rounded-xl border border-border bg-surface-alt/50 p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <GitCompare size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-primary">Often compared with {productName.split(' ').slice(-1)[0]}</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {pairs.map((pair) => (
          <Link
            key={pair.href}
            href={pair.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-primary hover:border-accent hover:text-accent transition-colors"
          >
            {pair.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
