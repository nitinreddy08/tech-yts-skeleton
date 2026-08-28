import type { MockClickLog } from '@/lib/mock/db'

export interface StoreClickStat {
  store: string
  count: number
  pct: number
}

export interface DailyClickStat {
  label: string
  date: string
  count: number
}

export function aggregateClicksByStore(clicks: MockClickLog[]): StoreClickStat[] {
  const counts = new Map<string, number>()
  for (const log of clicks) {
    counts.set(log.store_name, (counts.get(log.store_name) ?? 0) + 1)
  }
  const total = clicks.length || 1
  return [...counts.entries()]
    .map(([store, count]) => ({ store, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
}

export function aggregateClicksByDay(clicks: MockClickLog[], days = 7): DailyClickStat[] {
  const result: DailyClickStat[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)

    const count = clicks.filter((c) => {
      const t = new Date(c.clicked_at).getTime()
      return t >= d.getTime() && t < next.getTime()
    }).length

    result.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      date: d.toISOString().slice(0, 10),
      count,
    })
  }

  return result
}
