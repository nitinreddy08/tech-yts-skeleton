import type { SpecDiffRow } from '@/types'

/** Which products win each spec row (ties → all tied products win). */
export function specWinners(values: (string | number | boolean | null)[]): boolean[] {
  const nums = values.map((v) => (typeof v === 'number' ? v : null))
  if (nums.some((n) => n !== null)) {
    const max = Math.max(...(nums.filter((n) => n !== null) as number[]))
    return nums.map((n) => n === max)
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
    const winners = specWinners(row.values)
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
