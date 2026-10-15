import { CheckCircle, XCircle } from 'lucide-react'

interface BottomLineVerdictProps {
  rating: number
  pros: string[]
  cons: string[]
  productName?: string
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

/** Wirecutter "The Bottom Line" — the verdict word, a one-line summary, then pros and cons.
 *  The numeric score lives in the product header (once), not here. */
export function BottomLineVerdict({ pros, cons, rating }: BottomLineVerdictProps) {
  const meta = verdictMeta(rating)

  return (
    <section className={`rounded-xl border p-4 md:p-5 ${TONE_STYLES[meta.tone]}`}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-h3 font-heading">{meta.label}</h2>
        <p className="text-sm opacity-80">{meta.summary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {pros.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">What we loved</h3>
            <ul className="flex flex-col gap-2">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle size={15} className="mt-0.5 shrink-0 text-success-700" aria-hidden />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cons.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold">Watch out for</h3>
            <ul className="flex flex-col gap-2">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <XCircle size={15} className="mt-0.5 shrink-0 text-error-700" aria-hidden />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
