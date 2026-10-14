import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import type { RelatedGuide } from '@/lib/data/related-guides'

interface RelatedGuidesStripProps {
  guides: RelatedGuide[]
  productName: string
}

function rankLabel(rank: number, total: number): string {
  if (rank === 1) return '#1 pick'
  if (rank === 2) return '#2 pick'
  if (rank === 3) return '#3 pick'
  return `#${rank} of ${total}`
}

export function RelatedGuidesStrip({ guides, productName }: RelatedGuidesStripProps) {
  if (guides.length === 0) return null

  return (
    <section className="rounded-xl border border-border bg-surface-alt p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-accent" />
        <h2 className="font-heading text-sm font-bold text-primary">Featured in our guides</h2>
      </div>
      <p className="text-xs text-muted mb-4">
        {productName} appears in {guides.length} editor&apos;s {guides.length === 1 ? 'guide' : 'guides'}
      </p>
      <div className="flex flex-col gap-2">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/best-of/${g.slug}`}
            className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 hover:border-accent/40 hover:shadow-sm transition-all"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary group-hover:text-accent transition-colors line-clamp-1">
                {g.title}
              </p>
              {g.pickReason && (
                <p className="text-xs text-muted line-clamp-1 mt-0.5">{g.pickReason}</p>
              )}
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-2.5 py-1 text-[11px] font-bold">
              {rankLabel(g.rank, g.totalPicks)}
              <ChevronRight size={12} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
