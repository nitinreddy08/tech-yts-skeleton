import Link from 'next/link'
import { ThumbsUp, ThumbsDown, ArrowDown } from 'lucide-react'
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
  great: 'border-green-200 bg-green-50 text-green-900',
  good: 'border-accent/30 bg-accent/5 text-primary',
  mixed: 'border-amber-200 bg-amber-50 text-amber-950',
  skip: 'border-border bg-surface-alt text-primary',
}

const BADGE_STYLES = {
  great: 'bg-green-600 text-white',
  good: 'bg-accent text-white',
  mixed: 'bg-amber-500 text-white',
  skip: 'bg-muted text-white',
}

/** Wirecutter "The Bottom Line" — scan before you scroll */
export function BottomLineVerdict({ rating, pros, cons, productName }: BottomLineVerdictProps) {
  const meta = verdictMeta(rating)

  return (
    <section className={`rounded-xl border p-5 ${TONE_STYLES[meta.tone]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
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

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {pros[0] && (
          <div className="flex items-start gap-2 text-sm">
            <ThumbsUp size={15} className="shrink-0 mt-0.5 opacity-70" />
            <span>{pros[0]}</span>
          </div>
        )}
        {cons[0] && (
          <div className="flex items-start gap-2 text-sm">
            <ThumbsDown size={15} className="shrink-0 mt-0.5 opacity-70" />
            <span>{cons[0]}</span>
          </div>
        )}
      </div>

      <a
        href="#buy-section-anchor"
        className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
      >
        See best prices <ArrowDown size={14} />
      </a>
    </section>
  )
}
