export const RECENT_COMPARES_KEY = 'techreviews-recent-compares'
export const MAX_RECENT_COMPARES = 6

export interface RecentCompare {
  id: string
  slugs: string[]
  label: string
  visitedAt: string
}

export function loadRecentCompares(): RecentCompare[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_COMPARES_KEY) ?? '[]') as RecentCompare[]
  } catch {
    return []
  }
}

export function saveRecentCompare(slugs: string[], names: string[]): void {
  if (slugs.length < 2 || names.length < 2) return
  const key = [...slugs].sort().join('|')
  const label = names.slice(0, 3).join(' vs ') + (names.length > 3 ? '…' : '')
  const entry: RecentCompare = {
    id: key,
    slugs: slugs.slice(0, 4),
    label,
    visitedAt: new Date().toISOString(),
  }
  const next = [entry, ...loadRecentCompares().filter((c) => c.id !== key)].slice(0, MAX_RECENT_COMPARES)
  localStorage.setItem(RECENT_COMPARES_KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('recent-compares-updated'))
}
