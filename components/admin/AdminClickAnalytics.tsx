import { BarChart3 } from 'lucide-react'
import type { MockClickLog } from '@/lib/mock/db'
import { aggregateClicksByDay, aggregateClicksByStore } from '@/lib/admin/click-analytics'

const STORE_COLORS: Record<string, string> = {
  Amazon: 'bg-orange-500',
  Flipkart: 'bg-blue-500',
  'Apple Store': 'bg-gray-600',
}

interface AdminClickAnalyticsProps {
  clicks: MockClickLog[]
}

export function AdminClickAnalytics({ clicks }: AdminClickAnalyticsProps) {
  const byStore = aggregateClicksByStore(clicks)
  const byDay = aggregateClicksByDay(clicks, 7)
  const maxDay = Math.max(...byDay.map((d) => d.count), 1)

  if (clicks.length === 0) return null

  return (
    <section className="rounded-xl border border-border bg-surface overflow-hidden mb-8">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <BarChart3 size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-primary">Affiliate Click Analytics</h2>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        {/* Store breakdown */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Clicks by store
          </p>
          <div className="space-y-3">
            {byStore.map(({ store, count, pct }) => (
              <div key={store}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-primary">{store}</span>
                  <span className="text-muted tabular-nums">
                    {count} · {pct}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-alt overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STORE_COLORS[store] ?? 'bg-accent'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day trend */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            Last 7 days
          </p>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {byDay.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] font-semibold text-primary tabular-nums">
                  {day.count > 0 ? day.count : ''}
                </span>
                <div
                  className="w-full rounded-t-md bg-accent/80 min-h-[4px] transition-all"
                  style={{ height: `${Math.max(4, (day.count / maxDay) * 100)}%` }}
                  title={`${day.label}: ${day.count} clicks`}
                />
                <span className="text-[9px] text-muted text-center leading-tight">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
