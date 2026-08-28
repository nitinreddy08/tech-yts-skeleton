// SpecTemplate and SpecField
export interface SpecField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean' | 'multiselect'
  unit?: string
  options?: string[]
  required?: boolean
  defaultValue?: string | number | boolean
  group?: string
}

export interface SpecTemplate {
  fields: SpecField[]
}

// Category and Brand
export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description: string | null
  spec_template: SpecTemplate
  display_order: number
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

// AffiliateLink
export interface AffiliateLink {
  id: string
  product_id: string
  store_name: string
  store_icon: string | null
  affiliate_url: string  // always /go/[id] on the client side
  price_inr: number | null
  is_best_price: boolean
  last_updated: string
  stock_status?: StockStatus
}

// FAQ
export interface FAQ {
  id: string
  product_id: string
  question: string
  answer: string
  display_order: number
}

// ProductSummary (for cards, lists)
export interface ProductSummary {
  id: string
  name: string
  slug: string
  category_id: string
  category_slug: string
  brand_id: string
  brand_name: string
  thumbnail_url: string
  creator_rating: number
  current_price_inr: number | null
  launch_price_inr: number | null
  is_featured: boolean
  is_deal_of_the_day: boolean
  deal_badge_text: string | null
  tags: string[]
  youtube_video_url: string | null
  created_at: string
}

export interface ProductBenchmarks {
  antutu?: number
  geekbench_single?: number
  geekbench_multi?: number
}

// ProductDetail (full)
export interface ProductDetail extends ProductSummary {
  tagline: string | null
  description: string | null
  specifications: Record<string, string | number | boolean | null>
  benchmarks?: ProductBenchmarks
  pros: string[]
  cons: string[]
  youtube_short_url: string | null
  gallery_images: string[]
  is_published: boolean
  updated_at: string
  affiliate_links: AffiliateLink[]
  faqs: FAQ[]
  category: Category
  brand: Brand
}

// Deal
export interface Deal {
  id: string
  product_id: string
  deal_type: 'deal_of_day' | 'price_drop' | 'upcoming_sale' | 'bank_offer' | 'sale_event' | 'coupon'
  headline: string
  original_price_inr: number | null
  deal_price_inr: number | null
  store_name: string
  affiliate_url: string
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
  product?: ProductSummary
}

// BestOfList
export interface BestOfListItem {
  id: string
  list_id: string
  product_id: string
  product: ProductSummary
  rank: number
  pick_reason: string | null
}

export interface BestOfList {
  id: string
  title: string
  slug: string
  description: string
  cover_image_url: string | null
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
  items: BestOfListItem[]
}

// ClickLog
export interface ClickLog {
  id: string
  affiliate_link_id: string
  product_id: string
  store_name: string
  clicked_at: string
  user_agent: string | null
  referrer: string | null
  ip_hash: string | null
}

// Search
export interface SearchResult {
  id: string
  name: string
  slug: string
  category_slug: string
  thumbnail_url: string
  current_price_inr: number | null
  type: 'product' | 'category' | 'brand'
  brand_name?: string
  creator_rating?: number
}

// Comparison engine
export interface CompareState {
  productIds: string[]
  products: ProductDetail[]
}

export interface CompareActions {
  addProduct: (id: string) => void
  removeProduct: (id: string) => void
  clearAll: () => void
}

export interface SpecDiffRow {
  specKey: string
  label: string
  values: (string | number | boolean | null)[]
  hasDiff: boolean
}

// Filtering and sorting
export type SortOption = 'price_asc' | 'price_desc' | 'rating_desc' | 'newest' | 'popular'

export interface ProductFilters {
  brands?: string[]
  priceRange?: { min: number; max: number }
  rating?: number
  specs?: Record<string, string | number | boolean>
}

// Admin form
export interface ProductFormData {
  name: string
  slug: string
  category_id: string
  brand_id: string
  tagline?: string
  description?: string
  specifications: Record<string, string | number | boolean | null>
  pros: string[]
  cons: string[]
  creator_rating: number
  youtube_video_url?: string
  youtube_short_url?: string
  thumbnail_url: string
  gallery_images: string[]
  launch_price_inr?: number
  current_price_inr?: number
  is_featured: boolean
  is_deal_of_the_day: boolean
  deal_badge_text?: string
  is_published: boolean
  tags: string[]
  affiliate_links: Omit<AffiliateLink, 'id' | 'product_id'>[]
  faqs: Omit<FAQ, 'id' | 'product_id'>[]
}
