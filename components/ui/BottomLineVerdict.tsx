import { CheckCircle, XCircle, ArrowDown } from 'lucide-react'
import { siteConfig } from '@/lib/config'

interface BottomLineVerdictProps {
  rating: number
  pros: string[]
  cons: string[]
  productName: string
}

function verdictMeta(rating: number): {
  label: string
  tone: 'great' | 'good' | 'mixed' | 'skip'
  summary: string
} {
  if (rating >= 9) {
    return {
      label: 'Highly Recommended',
      tone: 'great',
      summary: 'An easy pick — excels in most areas we test.',
    }
  }
  if (rating >= 8) {
    return {
      label: 'Recommended',
      tone: 'good',
      summary: 'A strong buy if it fits your budget and needs.',
    }
  }
  if (rating >= 7) {
    return {
      label: 'Good with Caveats',
      tone: 'mixed',
      summary: 'Worth considering — but know the trade-offs below.',
    }
  }
  return {
    label: 'Wait for a Deal',
    tone: 'skip',
    summary: 'Hard to recommend at full price unless you find a steep discount.',
  }
}

const TONE_STYLES = {
  great: 'border-success-500/40 bg-success-50 text-primary',
  good: 'border-accent/30 bg-accent/5 text-primary',
  mixed: 'border-secondary-300 bg-secondary-50 text-primary',
  skip: 'border-border bg-surface-alt text-primary',
}

const BADGE_STYLES = {
  great: 'bg-success-700 text-white',
  good: 'bg-accent text-white',
  mixed: 'bg-secondary-800 text-white',
  skip: 'bg-neutral-800 text-white',
}

/** Wirecutter "The Bottom Line" — scan before you scroll */
export function BottomLineVerdict({ rating, pros, cons, productName }: BottomLineVerdictProps) {
  const meta = verdictMeta(rating)

  return (
    <section className={`rounded-xl border p-5 ${TONE_STYLES[meta.tone]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">
            The Bottom Line
          </p>
          <h2 className="font-heading text-lg font-bold">{meta.label}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE_STYLES[meta.tone]}`}>
          {rating.toFixed(1)}/10
        </span>
      </div>

      <p className="text-sm leading-relaxed opacity-90 mb-4">
        {meta.summary} {siteConfig.creator_name ? `${siteConfig.creator_name} rated ${productName} ${rating.toFixed(1)}/10.` : ''}
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {pros.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
              What we loved
            </p>
            <ul className="flex flex-col gap-2">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle size={15} className="shrink-0 mt-0.5 text-success-700" aria-hidden />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cons.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
              Watch out for
            </p>
            <ul className="flex flex-col gap-2">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle size={15} className="shrink-0 mt-0.5 text-error-700" aria-hidden />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <a
        href="#buy-box"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        See best prices <ArrowDown size={14} aria-hidden />
      </a>
    </section>
  )
}
