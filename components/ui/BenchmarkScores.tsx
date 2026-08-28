import { Gauge } from 'lucide-react'
import type { ProductBenchmarks } from '@/types'

interface BenchmarkScoresProps {
  benchmarks: ProductBenchmarks
  productName: string
}

const LABELS: Record<keyof ProductBenchmarks, string> = {
  antutu: 'AnTuTu',
  geekbench_single: 'Geekbench Single',
  geekbench_multi: 'Geekbench Multi',
}

/** Category medians for context bars (mock baselines). */
const MEDIAN: ProductBenchmarks = {
  antutu: 1700000,
  geekbench_single: 3200,
  geekbench_multi: 8500,
}

export function BenchmarkScores({ benchmarks, productName }: BenchmarkScoresProps) {
  const entries = (Object.keys(benchmarks) as (keyof ProductBenchmarks)[]).filter(
    (k) => benchmarks[k] != null
  )
  if (entries.length === 0) return null

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={18} className="text-accent" />
        <h2 className="font-heading text-sm font-bold text-primary">Benchmark scores</h2>
      </div>
      <p className="text-xs text-muted mb-4">
        Synthetic scores for {productName} — vs typical {entries.length > 0 ? 'flagship' : ''} baseline
      </p>
      <div className="space-y-4">
        {entries.map((key) => {
          const score = benchmarks[key]!
          const median = MEDIAN[key] ?? score
          const pct = Math.min(100, Math.round((score / median) * 50))
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-primary">{LABELS[key]}</span>
                <span className="font-bold text-accent tabular-nums">{score.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
