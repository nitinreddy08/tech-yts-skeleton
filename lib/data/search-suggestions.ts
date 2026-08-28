import { productRepository } from '@/lib/repositories'

const POPULAR_TERMS = [
  'OnePlus 13',
  'iPhone 16',
  'Samsung Galaxy S25',
  'Sony headphones',
  'MacBook Air',
  'best phones under 30000',
  '5g',
  'anc',
  'gaming laptop',
  'Redmi Note',
]

/** Baymard / Google-style "did you mean" from catalog tokens */
export async function getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
  const q = query.toLowerCase().trim()
  if (q.length < 2) return []

  const candidates = new Set<string>()
  const products = await productRepository.list()

  for (const p of products) {
    if (p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase().slice(0, 4))) {
      candidates.add(p.name)
    }
    if (p.brand_name.toLowerCase().includes(q)) candidates.add(p.brand_name)
    for (const tag of p.tags) {
      if (tag.includes(q) || q.includes(tag)) candidates.add(tag)
    }
  }

  for (const term of POPULAR_TERMS) {
    if (term.toLowerCase().includes(q) || levenshtein(q, term.toLowerCase()) <= 2) {
      candidates.add(term)
    }
  }

  return [...candidates]
    .filter((c) => c.toLowerCase() !== q)
    .slice(0, limit)
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}
