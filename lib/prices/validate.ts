/**
 * A scraped number is only trusted if it is believable next to the last known
 * price. Scrapers fail quietly by grabbing the wrong element (an EMI amount, a
 * cashback figure, a different variant) — a 70% "drop" is almost never real.
 */
export const OUTLIER_LOW = 0.5
export const OUTLIER_HIGH = 1.6

export function isPlausibleChange(next: number, previous: number | null | undefined): boolean {
  if (previous == null || previous <= 0) return true
  const ratio = next / previous
  return ratio >= OUTLIER_LOW && ratio <= OUTLIER_HIGH
}
