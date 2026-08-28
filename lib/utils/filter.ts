import type { ProductSummary, ProductFilters, SortOption } from '@/types'

export interface FilterableProduct extends ProductSummary {
  specifications?: Record<string, string | number | boolean | null>
}

function matchesSpecFilters(
  specifications: Record<string, string | number | boolean | null> | undefined,
  specs: Record<string, string | number | boolean>
): boolean {
  if (!specifications) return false

  for (const [key, filterVal] of Object.entries(specs)) {
    const specVal = specifications[key]
    if (specVal == null) return false

    if (typeof filterVal === 'boolean') {
      if (specVal !== filterVal) return false
    } else if (typeof filterVal === 'number') {
      if (typeof specVal !== 'number' || specVal < filterVal) return false
    } else if (String(specVal) !== String(filterVal)) {
      return false
    }
  }

  return true
}

export function filterAndSortProducts(
  products: FilterableProduct[],
  filters: ProductFilters,
  sort: SortOption,
  clickCounts?: Record<string, number>
): FilterableProduct[] {
  // Filter
  const result = products.filter((product) => {
    // Brand filter
    if (filters.brands && filters.brands.length > 0) {
      if (!filters.brands.includes(product.brand_name)) return false
    }

    // Price range filter
    if (filters.priceRange) {
      const price = product.current_price_inr
      if (price === null) return false
      if (price < filters.priceRange.min || price > filters.priceRange.max) return false
    }

    // Rating filter
    if (filters.rating !== undefined) {
      if (product.creator_rating < filters.rating) return false
    }

    // Spec filters (91Mobiles-style)
    if (filters.specs && Object.keys(filters.specs).length > 0) {
      if (!matchesSpecFilters(product.specifications, filters.specs)) return false
    }

    return true
  })

  // Sort (spread to avoid mutation)
  const sorted = [...result]

  switch (sort) {
    case 'price_asc':
      sorted.sort((a, b) => (a.current_price_inr ?? Infinity) - (b.current_price_inr ?? Infinity))
      break
    case 'price_desc':
      sorted.sort((a, b) => (b.current_price_inr ?? -Infinity) - (a.current_price_inr ?? -Infinity))
      break
    case 'rating_desc':
      sorted.sort((a, b) => b.creator_rating - a.creator_rating)
      break
    case 'newest':
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case 'popular':
      sorted.sort((a, b) => {
        const ca = clickCounts?.[a.id] ?? 0
        const cb = clickCounts?.[b.id] ?? 0
        if (cb !== ca) return cb - ca
        return b.creator_rating - a.creator_rating
      })
      break
  }

  return sorted
}
