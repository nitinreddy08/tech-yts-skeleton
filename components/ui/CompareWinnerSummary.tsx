import { Crown, Trophy } from 'lucide-react'
import { computeCompareScores, overallCompareWinner } from '@/lib/utils/compare-scores'
import type { ProductDetail, SpecDiffRow } from '@/types'

interface CompareWinnerSummaryProps {
  products: ProductDetail[]
  diffRows: SpecDiffRow[]
}

export function CompareWinnerSummary({ products, diffRows }: CompareWinnerSummaryProps) {
  if (products.length < 2) return null

  const scores = computeCompareScores(diffRows, products.length)
  const winnerIdx = overallCompareWinner(scores)

  if (scores[0].total === 0) return null

  return (
    <section className="rounded-xl border border-border bg-surface p-4" aria-label="Spec comparison summary">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-h3 text-primary">
          <Trophy size={16} className="text-accent" aria-hidden />
          Spec wins
        </h2>
        <p className="text-sm text-muted">
          {winnerIdx != null ? (
            <>
              <span className="font-semibold text-primary">{products[winnerIdx].name}</span> leads, across {scores[0].total} differing specs
            </>
          ) : (
            <>Across {scores[0].total} differing specs</>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {products.map((p, i) => {
          const { wins, total, pct } = scores[i]
          const isLeader = winnerIdx === i

          return (
            <div
              key={p.id}
              className={`min-w-[8rem] flex-1 rounded-lg border p-3 ${
                isLeader ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface-alt/50'
              }`}
            >
              <p className="mb-1 flex items-center gap-1.5 text-xs font-medium leading-tight text-primary">
                {isLeader && <Crown size={12} className="shrink-0 text-accent" aria-hidden />}
                <span className="line-clamp-1">{p.name}</span>
              </p>
              <div className="mb-2 flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-primary">{wins}</span>
                <span className="text-xs text-muted">of {total}</span>
                <span className="ml-auto text-xs font-semibold text-primary">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${isLeader ? 'bg-accent' : 'bg-primary/30'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
