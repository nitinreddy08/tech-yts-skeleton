import type { SpecDiffRow } from '@/types'

export type SpecDirection = 'higher' | 'lower' | 'neutral'

/** Specs where a smaller number is the better one (a lighter phone, a lower price). */
const LOWER_IS_BETTER = /(^|_)(weight|thickness|latency|price|charge_time|charging_time|bezel)(_|$)/
/** Specs where a bigger number is just different, not better (a larger driver isn't "winning"). */
const NEUTRAL_SIZE = /(^|_)(driver_size|display_size|screen_size|size|width|height|diagonal)(_|$)/

export function specDirection(specKey?: string): SpecDirection {
  if (!specKey) return 'higher'
  if (LOWER_IS_BETTER.test(specKey)) return 'lower'
  if (NEUTRAL_SIZE.test(specKey)) return 'neutral'
  return 'higher'
}

/**
 * Which products win each spec row (ties → all tied products win).
 * Direction matters: the lightest laptop wins "weight", not the heaviest, and a
 * bigger driver or screen is a difference, not a win.
 */
export function specWinners(
  values: (string | number | boolean | null)[],
  specKey?: string
): boolean[] {
  const direction = specDirection(specKey)
  const nums = values.map((v) => (typeof v === 'number' ? v : null))
  if (nums.some((n) => n !== null)) {
    if (direction === 'neutral') return values.map(() => false)
    const present = nums.filter((n) => n !== null) as number[]
    const best = direction === 'lower' ? Math.min(...present) : Math.max(...present)
    return nums.map((n) => n === best)
  }

  const bools = values.map((v) => (typeof v === 'boolean' ? v : null))
  if (bools.every((b) => b === null)) return values.map(() => false)
  if (bools.some((b) => b === true)) return bools.map((b) => b === true)

  return values.map(() => false)
}

export interface CompareScore {
  wins: number
  total: number
  pct: number
}

/** Count spec wins per product — only rows where values differ. */
export function computeCompareScores(
  diffRows: SpecDiffRow[],
  productCount: number
): CompareScore[] {
  const wins = Array.from({ length: productCount }, () => 0)
  let total = 0

  for (const row of diffRows) {
    if (!row.hasDiff) continue
    const winners = specWinners(row.values, row.specKey)
    if (!winners.some(Boolean)) continue
    total++
    winners.forEach((won, i) => {
      if (won && i < productCount) wins[i]++
    })
  }

  return wins.map((w) => ({
    wins: w,
    total,
    pct: total > 0 ? Math.round((w / total) * 100) : 0,
  }))
}

export function overallCompareWinner(scores: CompareScore[]): number | null {
  if (scores.length === 0 || scores[0].total === 0) return null
  const maxWins = Math.max(...scores.map((s) => s.wins))
  const leaders = scores.map((s, i) => (s.wins === maxWins ? i : -1)).filter((i) => i >= 0)
  return leaders.length === 1 ? leaders[0] : null
}
