/** Shared 0–10 creator-score helpers (bands match ScoreRing). */

export function scoreVerdict(score: number): string {
  if (score >= 9.5) return 'Outstanding'
  if (score >= 9) return 'Excellent'
  if (score >= 8.5) return 'Very Good'
  if (score >= 8) return 'Good'
  if (score >= 7) return 'Decent'
  if (score >= 6) return 'Average'
  return 'Below Average'
}

/** Solid fill for white text — each step is dark enough for ≥4.5:1 against white. */
export function scoreFillClass(score: number): string {
  if (score >= 9) return 'bg-success-700'
  if (score >= 8) return 'bg-primary-600'
  if (score >= 7) return 'bg-secondary-800'
  return 'bg-neutral-800'
}
