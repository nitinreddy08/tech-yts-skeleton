export const RECENT_SEARCHES_KEY = 'techreviews-recent-searches'
export const MAX_RECENT_SEARCHES = 5

export function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function saveRecentSearch(term: string): void {
  const trimmed = term.trim()
  if (!trimmed) return
  const recent = loadRecentSearches().filter((r) => r.toLowerCase() !== trimmed.toLowerCase())
  recent.unshift(trimmed)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)))
}

export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

export function removeRecentSearch(term: string): void {
  const recent = loadRecentSearches().filter((r) => r.toLowerCase() !== term.toLowerCase())
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent))
}
