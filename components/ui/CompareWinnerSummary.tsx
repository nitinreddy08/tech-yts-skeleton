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
    <section
      className="rounded-xl border border-border bg-surface p-5"
      aria-label="Spec comparison summary"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Trophy size={16} className="text-accent" aria-hidden />
            Spec win tally
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Based on {scores[0].total} differing specs — the better value on each, on paper
          </p>
        </div>
        {winnerIdx != null && (
          <p className="text-xs font-semibold text-accent flex items-center gap-1.5 shrink-0">
            <Crown size={14} />
            {products[winnerIdx].name} leads on specs
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => {
          const { wins, total, pct } = scores[i]
          const isLeader = winnerIdx === i

          return (
            <div
              key={p.id}
              className={`rounded-lg border p-3 ${
                isLeader ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface-alt/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-medium text-primary line-clamp-2 leading-tight">{p.name}</p>
                {isLeader && <Crown size={14} className="text-accent shrink-0 mt-0.5" />}
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-bold text-primary">{wins}</span>
                <span className="text-xs text-muted">/ {total} specs</span>
                <span className="text-xs font-semibold text-accent ml-auto">{pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isLeader ? 'bg-accent' : 'bg-primary/30'}`}
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
