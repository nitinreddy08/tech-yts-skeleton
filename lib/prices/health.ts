import type { FailureReason, HealthReport, LinkResult, StoreHealth } from './types'

/**
 * Decides what a store's run means:
 *  - broken   — pages load but we can't read a price from them (the layout changed → run /update-scraper)
 *  - blocked  — the store is refusing or unreachable (a layout fix won't help)
 *  - degraded — some links fail, most work
 *  - ok / idle
 * "Broken" is the only status the CI job treats as a failure.
 */
export function classifyStore(results: LinkResult[], previous: StoreHealth | undefined, now: string): StoreHealth {
  const attempted = results.filter((r) => r.status !== 'skipped')
  const okCount = attempted.filter((r) => r.status === 'ok').length
  const failed: Partial<Record<FailureReason, number>> = {}
  for (const r of attempted) if (r.status === 'failed' && r.reason) failed[r.reason] = (failed[r.reason] ?? 0) + 1

  const parseFails = (failed.parse ?? 0) + (failed.currency ?? 0)
  const unreachable = (failed.blocked ?? 0) + (failed.network ?? 0) + (failed.http_error ?? 0)

  let status: StoreHealth['status']
  if (attempted.length === 0) status = 'idle'
  else if (parseFails > 0 && parseFails / attempted.length >= 0.5) status = 'broken'
  else if (unreachable > 0 && unreachable / attempted.length >= 0.5) status = 'blocked'
  else if (attempted.length - okCount > 0) status = 'degraded'
  else status = 'ok'

  return {
    status,
    attempted: attempted.length,
    ok: okCount,
    failed,
    last_ok_at: okCount > 0 ? now : (previous?.last_ok_at ?? null),
    checked_at: now,
    failures: attempted
      .filter((r) => r.status === 'failed' && r.reason)
      .map((r) => ({ linkId: r.linkId, url: r.url, reason: r.reason!, detail: r.detail })),
  }
}

export function buildHealthReport(results: LinkResult[], previous: HealthReport, now: string): HealthReport {
  const byStore = new Map<string, LinkResult[]>()
  for (const r of results) byStore.set(r.storeKey, [...(byStore.get(r.storeKey) ?? []), r])
  const stores = { ...previous.stores }
  for (const [store, rs] of byStore) stores[store] = classifyStore(rs, previous.stores[store], now)
  return { generated_at: now, stores }
}
