import { ProductCard } from '@/components/ui/ProductCard'
import type { RichSearchResult } from '@/lib/data/search'
import type { ProductSummary } from '@/types'

interface SearchResultCardProps {
  result: RichSearchResult
  query: string
}

function toProductSummary(result: RichSearchResult): ProductSummary {
  return {
    id: result.id,
    name: result.name,
    slug: result.slug,
    category_id: result.category_id,
    category_slug: result.category_slug,
    brand_id: result.brand_id,
    brand_name: result.brand_name,
    thumbnail_url: result.thumbnail_url,
    creator_rating: result.creator_rating,
    current_price_inr: result.current_price_inr,
    launch_price_inr: result.launch_price_inr,
    is_featured: result.is_featured,
    is_deal_of_the_day: result.is_deal_of_the_day,
    // A live deal wins the badge slot. Launch-price "% off" is deliberately not
    // shown here: it describes a different thing than a deal and used to sit
    // beside it in a second style.
    deal_badge_text:
      result.has_active_deal && result.deal_savings_percent != null
        ? `${result.deal_savings_percent}% OFF`
        : result.deal_badge_text,
    tags: result.tags,
    youtube_video_url: result.youtube_video_url,
    created_at: result.created_at,
  }
}

/**
 * Search results use the same card as every other listing, so score, price,
 * deal badge, compare and quick-view behave identically everywhere. Search adds
 * a title highlight and the category tag (results span categories).
 */
export function SearchResultCard({ result, query }: SearchResultCardProps) {
  return <ProductCard product={toProductSummary(result)} highlight={query} showCategory />
}
