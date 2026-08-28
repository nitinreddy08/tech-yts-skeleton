# Requirements Document

## Introduction

This document defines the requirements for the White-Label Tech Creator Affiliate & Product Comparison Platform — a full-stack Next.js 14+ application enabling Indian tech YouTubers to publish curated product reviews, compare specs, surface affiliate links across major Indian retailers, and manage all content through a protected admin panel. The entire branding layer is driven by a `site_config` table, making the platform redeployable for any creator without code changes.

## Glossary

- **Platform**: The full-stack Next.js + Supabase application described in this document
- **Creator**: The tech YouTuber who owns and operates a deployed instance of the Platform
- **Visitor**: An unauthenticated end-user browsing the public-facing site
- **Admin**: The authenticated Creator managing content through the admin panel
- **SiteConfig**: The single database row that stores all branding and configuration tokens for a deployment
- **Product**: A tech product entry with specifications, pricing, affiliate links, and creator review content
- **Category**: A product grouping (e.g., Smartphones, Laptops) with an associated spec template
- **SpecTemplate**: A category-level schema defining which specification fields apply to products in that category
- **AffiliateLink**: A tracked URL pointing to a product listing on an external retailer, routed through `/go/[id]`
- **ClickLog**: A privacy-safe record of an affiliate link click, storing a hashed IP rather than the raw address
- **Deal**: A time-bounded price promotion associated with a product and retailer
- **BestOfList**: A curated ranked list of products with per-item pick reasons authored by the Creator
- **ComparisonEngine**: The client-side module that manages which products are being compared and renders the spec-diff table
- **Middleware**: The Next.js middleware layer that enforces authentication on all `/admin/*` routes
- **RLS**: Supabase Row Level Security policies controlling database read/write access by authentication state
- **JSON-LD**: Structured data embedded in product pages for search engine rich results
- **ISR**: Incremental Static Regeneration — Next.js page caching strategy with timed revalidation
- **pg_trgm**: PostgreSQL trigram extension used for full-text search

---

## Requirements

### Requirement 1: White-Label Site Configuration

**User Story:** As a Creator, I want all branding (name, logo, colors, social links) to be driven by a single database row, so that the Platform can be redeployed for any creator without modifying code.

#### Acceptance Criteria

1. THE Platform SHALL load the `SiteConfig` row once in the root layout server component and make it available to all pages and components.
2. WHEN the root layout renders, THE Platform SHALL inject `--color-primary` and `--color-secondary` as CSS custom properties on the `<html>` element using values from `SiteConfig`.
3. THE SiteConfig SHALL include: `site_name`, `tagline`, `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `creator_name`, `creator_photo_url`, `creator_youtube_channel_url`, `social_links`, `footer_text`, `google_adsense_id`, `google_analytics_id`, `meta_default_title`, and `meta_default_description`.
4. WHEN `google_adsense_id` is present in `SiteConfig`, THE Platform SHALL load the Google AdSense script.
5. WHEN `google_analytics_id` is present in `SiteConfig`, THE Platform SHALL load the Google Analytics script.
6. THE Platform SHALL expose `SiteConfig` to all client components via a React context provider.

---

### Requirement 2: Product Catalog and Detail Pages

**User Story:** As a Visitor, I want to browse and read detailed product reviews with specs, pricing, and video embeds, so that I can make informed purchase decisions.

#### Acceptance Criteria

1. WHEN a Visitor navigates to `/[category_slug]/[product_slug]`, THE Platform SHALL render a product detail page with gallery, specifications, pros/cons, creator rating, and FAQ accordion.
2. WHEN `youtube_video_url` is set on a Product, THE Platform SHALL embed the YouTube video on the product detail page.
3. THE Platform SHALL display the creator rating as a value between 0.0 and 10.0.
4. WHEN a product detail page is rendered, THE Platform SHALL include a JSON-LD `Product` schema with one `Offer` per `AffiliateLink`.
5. WHEN `fetchProductDetail` is called with a slug for a product where `is_published = false`, THE Platform SHALL return null and render a 404 page.
6. WHEN `fetchProductDetail` is called with a slug that does not exist, THE Platform SHALL return null and render a 404 page.
7. THE Platform SHALL generate page metadata with title in the format `"{product.name} Review & Price in India | {config.site_name}"`, Open Graph image set to `thumbnail_url`, and a canonical URL pointing to the absolute product page URL.
8. WHEN a product detail page is rendered, THE Platform SHALL display affiliate links sorted by `price_inr` ascending.

---

### Requirement 3: Category Pages with Filtering and Sorting

**User Story:** As a Visitor, I want to browse products within a category and filter or sort them by brand, price, rating, and specs, so that I can find products matching my needs.

#### Acceptance Criteria

1. WHEN a Visitor navigates to `/[category_slug]`, THE Platform SHALL display a grid of published products in that category.
2. WHEN a brand filter is active, THE Platform SHALL return only products whose `brand_name` is in the selected brands list.
3. WHEN a price range filter is active, THE Platform SHALL return only products whose `current_price_inr` is within the specified `min` and `max` range inclusive.
4. WHEN a minimum rating filter is active, THE Platform SHALL return only products whose `creator_rating` is greater than or equal to the specified minimum.
5. WHEN spec-based filters are active, THE Platform SHALL return only products whose `specifications` values match all specified spec key-value pairs.
6. WHEN multiple filters are active simultaneously, THE Platform SHALL return only products satisfying ALL active filter conditions.
7. THE `filterAndSortProducts` function SHALL NOT mutate the original input products array.
8. WHEN a sort option is applied, THE Platform SHALL sort products by: `price_asc` (current_price_inr ascending), `price_desc` (current_price_inr descending), `rating_desc` (creator_rating descending), `newest` (created_at descending), or `popular` (click_count descending).
9. WHEN no products match the active filters, THE Platform SHALL return an empty array and display an appropriate empty state.

---

### Requirement 4: Affiliate Link Click Tracking and Redirect

**User Story:** As a Creator, I want every affiliate link click to be tracked and redirected through the Platform, so that I can measure performance and maintain GDPR-safe analytics.

#### Acceptance Criteria

1. WHEN a Visitor clicks an affiliate link, THE Platform SHALL route the request through `/go/[affiliate_link_id]` before redirecting to the retailer.
2. WHEN a valid `affiliate_link_id` is received at `/go/[id]`, THE Platform SHALL insert a `ClickLog` row and return an HTTP 302 redirect to the stored `affiliate_url`.
3. WHEN inserting a `ClickLog`, THE Platform SHALL store `ip_hash` as the SHA-256 hash of the client IP address — the raw IP address SHALL NOT be stored.
4. THE `ClickLog` SHALL record: `affiliate_link_id`, `product_id`, `store_name`, `clicked_at`, `user_agent`, `referrer`, and `ip_hash`.
5. WHEN an invalid or non-existent `affiliate_link_id` is received at `/go/[id]`, THE Platform SHALL return HTTP 404 and SHALL NOT insert a `ClickLog` row.
6. THE Platform SHALL perform the `ClickLog` insert asynchronously (fire-and-forget) so that redirect latency is not increased by the database write.
7. THE Platform SHALL only redirect to URLs stored in the `affiliate_links` table — open redirects to arbitrary URLs SHALL NOT be permitted.

---

### Requirement 5: Product Comparison Engine

**User Story:** As a Visitor, I want to compare up to 4 products side-by-side with highlighted spec differences, so that I can quickly identify the best option for my needs.

#### Acceptance Criteria

1. THE ComparisonEngine SHALL allow a maximum of 4 products to be selected for comparison at any time.
2. WHEN products are added to the comparison, THE Platform SHALL persist the selected product IDs in both `localStorage` and URL parameters.
3. WHEN a Visitor navigates to `/compare/[slug1]-vs-[slug2]`, THE Platform SHALL render a side-by-side spec comparison table.
4. WHEN `buildSpecDiffTable` is called, THE Platform SHALL return one `SpecDiffRow` per spec key defined in the category's `SpecTemplate`, in the same order as `SpecTemplate.fields`.
5. WHEN `buildSpecDiffTable` is called, THE Platform SHALL set `hasDiff = true` on a row if and only if at least two products have different non-null values for that spec key.
6. WHEN `buildSpecDiffTable` is called, THE Platform SHALL exclude rows where all products have a null value for that spec key.
7. THE ComparisonEngine SHALL only accept products from the same category (same spec keys) for comparison.
8. THE Platform SHALL display a quick verdict box identifying best-value and best-performance picks among compared products.

---

### Requirement 6: Affiliate Buy Section

**User Story:** As a Visitor, I want to see all available purchase options sorted by price on a product page, so that I can quickly find the best deal.

#### Acceptance Criteria

1. THE BuySection SHALL display all `AffiliateLink` entries for a product sorted by `price_inr` ascending.
2. THE BuySection SHALL mark the lowest-priced link with a "best price" badge.
3. WHEN an `AffiliateLink` is rendered, THE Platform SHALL use the internal `/go/[id]` URL as the href — the raw `affiliate_url` SHALL NOT be exposed in the rendered HTML.
4. THE BuySection SHALL display the store name, store icon, price in Indian Rupee format, and `last_updated` timestamp for each link.
5. THE BuySection SHALL be displayed as a sticky sidebar on desktop and a sticky bottom bar on mobile.

---

### Requirement 7: Search

**User Story:** As a Visitor, I want to search for products by name, brand, category, or tags, so that I can quickly find what I'm looking for.

#### Acceptance Criteria

1. WHEN a Visitor types in the search input, THE Platform SHALL display auto-suggest results after a 300ms debounce.
2. THE `searchProducts` function SHALL search across product name, tags, brand name, and category name fields.
3. WHEN a search query matches a product's name, tags, brand name, or category name, THE Platform SHALL include that product in the search results.
4. THE Platform SHALL provide a full search results page at `/search?q=...`.
5. THE `SearchResult` SHALL include: `id`, `name`, `slug`, `category_slug`, `thumbnail_url`, `current_price_inr`, and `type` (`"product"`, `"category"`, or `"brand"`).

---

### Requirement 8: Admin Panel — Authentication and Authorization

**User Story:** As a Creator, I want all admin routes to be protected by authentication, so that only I can manage content on my platform.

#### Acceptance Criteria

1. WHEN a request is made to any `/admin/*` route, THE Middleware SHALL verify the Supabase Auth session from the request cookie.
2. WHEN no valid session is found, THE Middleware SHALL redirect the request to `/admin/login`.
3. WHEN a valid session is found, THE Middleware SHALL allow the request to proceed to the admin page.
4. WHEN an Admin's session expires mid-session, THE Middleware SHALL redirect the next request to `/admin/login` with a `redirectTo` parameter containing the originally requested URL.
5. THE Platform SHALL use Supabase Row Level Security so that unauthenticated database clients can only `SELECT` rows where `is_published = true`.
6. THE Platform SHALL use Supabase Row Level Security so that all `INSERT`, `UPDATE`, and `DELETE` operations require an authenticated admin session.

---

### Requirement 9: Admin Panel — Product Management

**User Story:** As an Admin, I want to create, edit, and publish products with dynamic spec fields driven by the selected category, so that I can maintain an accurate and up-to-date product catalog.

#### Acceptance Criteria

1. THE Admin product form SHALL dynamically render spec input fields based on the selected category's `SpecTemplate`.
2. WHEN the category selection changes in the Admin product form, THE Platform SHALL fetch the new category's `SpecTemplate` and re-render the spec fields.
3. THE Admin product form SHALL support field types: `text`, `number`, `select`, `boolean`, and `multiselect`.
4. WHEN a required spec field is empty at form submission, THE Platform SHALL prevent submission and display a validation error for that field.
5. THE Admin product form SHALL support image upload to Supabase Storage for `thumbnail_url` and `gallery_images`.
6. WHEN a Supabase Storage image upload fails, THE Platform SHALL display an inline error and abort the product save without persisting partial data.
7. THE Platform SHALL prevent setting `is_published = true` on a product that has no `AffiliateLink` entries.
8. THE Platform SHALL prevent setting `is_published = true` on a product that has no `thumbnail_url`.
9. THE Admin panel SHALL support bulk product import via CSV file upload.
10. THE `Product.slug` SHALL be unique across all products, URL-safe, and auto-generated from `product.name` if not explicitly provided.
11. THE `Product.creator_rating` SHALL be validated to be a value between 0.0 and 10.0 inclusive.
12. THE `Product.specifications` keys SHALL be validated against the parent category's `SpecTemplate.fields[].key` values.

---

### Requirement 10: Admin Panel — Deals Management

**User Story:** As an Admin, I want to create and manage time-bounded deals for products, so that I can surface promotions to Visitors.

#### Acceptance Criteria

1. WHEN creating a Deal, THE Platform SHALL validate that `deal_price_inr` is strictly less than `original_price_inr`.
2. WHEN `expires_at` is null on a Deal, THE Platform SHALL treat the deal as having no expiry.
3. WHEN a Deal's `expires_at` is in the past, THE Platform SHALL exclude it from all public-facing deal queries.
4. THE Platform SHALL automatically set `is_active = false` on Deals whose `expires_at` has passed, via a scheduled database function or cron job.
5. THE Deal SHALL record: `deal_type` (one of `"price_drop"`, `"bank_offer"`, `"sale_event"`, `"coupon"`), `headline`, `original_price_inr`, `deal_price_inr`, `store_name`, `affiliate_url`, `starts_at`, `expires_at`, and `is_active`.

---

### Requirement 11: Best-Of Lists

**User Story:** As a Creator, I want to publish curated ranked product lists with pick reasons, so that I can guide my audience toward top recommendations.

#### Acceptance Criteria

1. THE Admin SHALL be able to create, edit, and publish `BestOfList` entries with a title, slug, description, cover image, and display order.
2. EACH `BestOfListItem` SHALL have a `rank`, a reference to a `Product`, and a `pick_reason` text authored by the Creator.
3. WHEN a `BestOfList` is rendered publicly, THE Platform SHALL display items in ascending `rank` order.
4. WHEN `is_published = false` on a `BestOfList`, THE Platform SHALL not render it on any public page.

---

### Requirement 12: SEO and Structured Data

**User Story:** As a Creator, I want every product page to have complete SEO metadata and structured data, so that my content ranks well in search engines and displays rich results.

#### Acceptance Criteria

1. WHEN a product page is rendered, THE Platform SHALL include a JSON-LD `Product` schema with `aggregateRating` using `creator_rating` scaled to 10.
2. WHEN `youtube_video_url` is present on a product, THE Platform SHALL include a `review` field in the JSON-LD schema.
3. THE Platform SHALL generate a dynamic XML sitemap including all published product and category URLs.
4. THE Platform SHALL include Open Graph and Twitter Card metadata on all public pages.
5. THE Platform SHALL set `Cache-Control: s-maxage=60, stale-while-revalidate=300` on all public pages served through Vercel's edge network.
6. THE Platform SHALL use Next.js `generateStaticParams` for top products and ISR with 60-second revalidation for remaining product and category pages.

---

### Requirement 13: Performance and Image Optimization

**User Story:** As a Creator, I want the platform to load fast and score 90+ on Lighthouse, so that my audience has a good experience and my SEO rankings benefit.

#### Acceptance Criteria

1. THE Platform SHALL serve all product images through Next.js `<Image>` with automatic WebP conversion using Supabase Storage URLs.
2. THE Platform SHALL maintain database indexes on: `products(slug)`, `products(category_id, is_published)`, `affiliate_links(product_id)`, and `click_logs(clicked_at)`.
3. THE Platform SHALL use a `pg_trgm` GIN index on `products.name` and `products.tags` to support sub-100ms full-text search queries.
4. THE Platform SHALL code-split the admin panel from the public site so that admin JavaScript is never shipped to public Visitors.
5. WHEN the comparison page is rendered, THE Platform SHALL compute the spec diff table client-side from already-fetched product data without an additional database round-trip.

---

### Requirement 14: Security

**User Story:** As a Creator, I want the platform to follow security best practices, so that my content and my audience's data are protected.

#### Acceptance Criteria

1. THE Platform SHALL hash client IP addresses using SHA-256 before storing them in `ClickLog` — raw IP addresses SHALL NOT be persisted anywhere.
2. THE `/go/[id]` route handler SHALL only redirect to URLs stored in the `affiliate_links` database table — arbitrary redirect targets SHALL NOT be accepted.
3. THE Platform SHALL configure Content Security Policy headers in `next.config.js` to allow YouTube embed and Google AdSense domains.
4. THE Platform SHALL use `SameSite=Lax` cookies for admin session management to provide CSRF protection.
5. THE Supabase Storage bucket policy SHALL restrict image uploads to authenticated admin sessions only, while allowing public read access for product images.

---

### Requirement 15: Indian Price Formatting

**User Story:** As a Visitor, I want all prices displayed in the Indian Rupee format with lakh/thousand separators, so that prices are immediately readable to me.

#### Acceptance Criteria

1. THE `formatIndianPrice` function SHALL format prices using the `en-IN` locale with `INR` currency and zero decimal places.
2. FOR ALL non-negative integer inputs, THE `formatIndianPrice` function SHALL return a string beginning with the `₹` symbol.
3. WHEN `formatIndianPrice` is called with the value `129999`, THE Platform SHALL return `₹1,29,999`.
4. THE Platform SHALL use `formatIndianPrice` consistently for all price displays across product cards, buy sections, deals, and comparison tables.
