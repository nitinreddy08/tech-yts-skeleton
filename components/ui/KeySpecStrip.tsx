import type { SpecHighlight } from '@/lib/utils/spec-highlights'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface KeySpecStripProps {
  highlights: SpecHighlight[]
  className?: string
}

/**
 * Above-the-fold spec chips — GSMArena / 91Mobiles scan pattern.
 * Mobile users decide in seconds; prose comes later.
 */
export function KeySpecStrip({ highlights, className = '' }: KeySpecStripProps) {
  if (highlights.length === 0) return null

  return (
    <section
      className={`rounded-xl border border-border bg-surface p-4 ${className}`}
      aria-label="Key specifications"
    >
      <Eyebrow className="mb-3">Key Specs at a Glance</Eyebrow>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {highlights.map((h) => (
          <div
            key={h.key}
            className="rounded-lg bg-surface-alt border border-border px-3 py-2.5 text-center"
          >
            {h.icon && (
              <span className="text-base block mb-0.5" aria-hidden>
                {h.icon}
              </span>
            )}
            <p className="text-[11px] font-medium text-muted leading-tight truncate">{h.label}</p>
            <p className="text-[13px] font-bold text-primary mt-0.5 leading-snug line-clamp-2">{h.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
