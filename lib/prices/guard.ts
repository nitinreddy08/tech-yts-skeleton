import type { ScraperConfig } from './types'

/**
 * Safety gate for the automatic healer (and anyone editing a store config by hand). A heal may only change
 * a store's extraction rules and add a trimmed sample page — and never loosen the protections (hosts, API
 * settings, headers, price bounds, existing samples). Anything else rejects the whole change and a human is
 * asked instead. It is a cheap backstop against bugs in the healer itself.
 */
const CONFIG_RE = /^config\/price-scrapers\/[a-z0-9-]+\.json$/
const FIXTURE_RE = /^lib\/prices\/__tests__\/fixtures\/[A-Za-z0-9._-]+\.html$/

export const MAX_FIXTURE_BYTES = 300_000

export interface RepairChange {
  /** Repo-relative path (added, modified or deleted). */
  path: string
  /** Parsed config before / after, for config files only (null = absent or unparseable). */
  before?: ScraperConfig | null
  after?: ScraperConfig | null
  /** Size of the file after the change, for fixtures. */
  bytes?: number
  deleted?: boolean
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

export function validateRepair(changes: RepairChange[]): string[] {
  const problems: string[] = []
  if (changes.length === 0) problems.push('nothing changed')

  for (const c of changes) {
    if (c.deleted) {
      problems.push(`${c.path}: deleting files is not allowed`)
      continue
    }
    if (FIXTURE_RE.test(c.path)) {
      if ((c.bytes ?? 0) > MAX_FIXTURE_BYTES) problems.push(`${c.path}: sample is ${c.bytes} bytes — trim it to the relevant markup`)
      continue
    }
    if (!CONFIG_RE.test(c.path)) {
      problems.push(`${c.path}: not an allowed file (only config/price-scrapers/*.json and sample fixtures)`)
      continue
    }

    const { before, after } = c
    if (!after) {
      problems.push(`${c.path}: config is missing or not valid JSON`)
      continue
    }
    if (!after.store || !Array.isArray(after.hosts) || !Array.isArray(after.strategies) || after.strategies.length === 0) {
      problems.push(`${c.path}: needs "store", "hosts" and at least one strategy`)
      continue
    }
    if (!before) continue // a brand-new store config has nothing to compare against

    if (after.store !== before.store) problems.push(`${c.path}: "store" must not change`)
    if (!same(after.hosts, before.hosts)) problems.push(`${c.path}: "hosts" must not change`)
    if (!same(after.api, before.api)) problems.push(`${c.path}: "api" must not change (it can carry credentials)`)
    if (!same(after.requestHeaders, before.requestHeaders)) problems.push(`${c.path}: "requestHeaders" must not change`)
    if ((after.minPrice ?? 100) < (before.minPrice ?? 100)) problems.push(`${c.path}: "minPrice" must not be lowered`)
    if ((after.maxPrice ?? 5_000_000) > (before.maxPrice ?? 5_000_000)) problems.push(`${c.path}: "maxPrice" must not be raised`)

    const keep = new Set((after.samples ?? []).map((s) => `${s.fixture}|${s.expectedPrice}`))
    for (const s of before.samples ?? []) {
      if (!keep.has(`${s.fixture}|${s.expectedPrice}`)) problems.push(`${c.path}: existing sample ${s.fixture} must not be removed or changed`)
    }
  }
  return problems
}
