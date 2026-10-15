/**
 * Turns whatever a page printed into whole rupees: "₹1,29,999.00", "Rs. 79,999",
 * "79999", 79999.5. Takes the first number, so "₹1,299 – ₹1,499" reads as 1299.
 * Returns null when there is no positive number.
 */
export function parsePrice(raw: string | number | null | undefined): number | null {
  if (raw == null) return null
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : null
  const m = raw.replace(/ /g, ' ').match(/(\d[\d,]*(?:\.\d+)?)/)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null
}

/** Reads a dotted/indexed path such as `a.b[0].c` out of parsed JSON. */
export function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj
  for (const part of path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return cur
}
