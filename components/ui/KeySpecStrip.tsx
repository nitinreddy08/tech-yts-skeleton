import type { SpecHighlight } from '@/lib/utils/spec-highlights'

interface KeySpecStripProps {
  highlights: SpecHighlight[]
  className?: string
}

/** The spec tiles shoppers scan first (GSMArena / 91Mobiles pattern); prose comes later. */
export function KeySpecStrip({ highlights, className = '' }: KeySpecStripProps) {
  if (highlights.length === 0) return null

  return (
    <section className={className} aria-labelledby="key-specs-title">
      <h2 id="key-specs-title" className="mb-3 text-h3 font-heading text-primary">
        Key specs
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {highlights.map((h) => (
          <div key={h.key} className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-xs text-muted">
              {h.icon && <span aria-hidden>{h.icon}</span>}
              <span className="truncate">{h.label}</span>
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-primary">{h.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
