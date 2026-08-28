import { type NextRequest } from 'next/server'
import { searchProductsFull } from '@/lib/data/search'

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams
  const q = sp.get('q') ?? ''
  const limit = Number(sp.get('limit') ?? '10')
  const category = sp.get('category') ?? undefined
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined

  // Allow browse-by-filter without a text query (HeroFinder live count)
  if (q.trim().length >= 2 || category || minPrice != null || maxPrice != null) {
    const results = await searchProductsFull(q, { category, minPrice, maxPrice })
    return Response.json(results.slice(0, limit))
  }

  return Response.json([])
}
