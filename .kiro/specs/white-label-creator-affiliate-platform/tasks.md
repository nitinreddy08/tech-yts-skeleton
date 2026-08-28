# Implementation Plan: White-Label Tech Creator Affiliate & Product Comparison Platform

## Overview

Implementation follows the build order: project scaffold → database layer → public site (config, catalog, category, comparison, search) → affiliate redirect → admin panel → SEO/performance → security hardening.

## Tasks

- [x] 1. Project scaffold and configuration
  - Initialize Next.js 14+ App Router project with TypeScript and Tailwind CSS
  - Install all dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `schema-dts`, `react-hook-form`, `zod`, `fast-check`, `vitest`, `@testing-library/react`, `sharp`
  - Configure `vitest.config.ts` with jsdom environment and path aliases
  - Configure `tailwind.config.ts` with CSS custom property support (`bg-[var(--color-primary)]`)
  - Add `next.config.js` with Content Security Policy headers (YouTube, AdSense domains) and Supabase Storage image domain
  - Set up `.env.local` template with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - _Requirements: 13.4, 14.3_

- [ ] 2. Database schema and Supabase setup
  - [x] 2.1 Write Supabase migration: core tables
    - Create `site_config`, `categories`, `brands`, `products`, `affiliate_links`, `faqs`, `click_logs`, `deals`, `best_of_lists`, `best_of_list_items` tables with all columns matching the data models in the design
    - Add `UNIQUE` constraint on `products.slug`
    - Add `CHECK` constraint `creator_rating BETWEEN 0 AND 10` on `products`
    - Add `CHECK` constraint `deal_price_inr < original_price_inr` on `deals`
    - _Requirements: 9.10, 9.11, 10.1_

  - [x] 2.2 Write Supabase migration: indexes and search
    - Add indexes: `products(slug)`, `products(category_id, is_published)`, `affiliate_links(product_id)`, `click_logs(clicked_at)`
    - Enable `pg_trgm` extension and add GIN index on `products.name` and `products.tags`
    - _Requirements: 13.2, 13.3_

  - [x] 2.3 Write Supabase migration: Row Level Security policies
    - Enable RLS on all tables
    - Add policy: unauthenticated `SELECT` only where `is_published = true` on `products`, `best_of_lists`, `deals`
    - Add policy: all `INSERT`, `UPDATE`, `DELETE` require authenticated admin session
    - Add policy: `click_logs` insert allowed for all (anon) but no select for anon
    - _Requirements: 8.5, 8.6_

  - [x] 2.4 Write Supabase scheduled function for deal expiry
    - Create a Supabase database function that sets `is_active = false` on `deals` where `expires_at < now()`
    - Schedule it via `pg_cron` or Supabase Edge Function cron trigger
    - _Requirements: 10.4_

  - [x] 2.5 Seed `site_config` and `categories` with spec templates
    - Insert one `site_config` row with placeholder branding values
    - Insert all 9 categories (Smartphones, Laptops, Earbuds, Smartwatches, Tablets, Power Banks, Cameras, Smart TVs, Gaming Consoles) with their `spec_template` JSON matching the design's field definitions
    - _Requirements: 1.3, 9.1_

- [ ] 3. Supabase client utilities and shared types
  - [x] 3.1 Create Supabase client helpers
    - Write `lib/supabase/server.ts` — server component client using `@supabase/ssr` `createServerClient`
    - Write `lib/supabase/client.ts` — browser client using `createBrowserClient`
    - Write `lib/supabase/middleware.ts` — middleware client for session refresh
    - _Requirements: 8.1_

  - [x] 3.2 Define all TypeScript interfaces
    - Write `types/index.ts` with all interfaces from the design: `SiteConfig`, `SiteConfigContextValue`, `ProductDetail`, `ProductSummary`, `Category`, `Brand`, `AffiliateLink`, `FAQ`, `Deal`, `BestOfList`, `BestOfListItem`, `ClickLog`, `SpecTemplate`, `SpecField`, `SearchResult`, `CompareState`, `SpecDiffRow`, `ProductFilters`, `SortOption`
    - _Requirements: 1.3, 2.1, 5.4_

- [ ] 4. Utility functions
  - [x] 4.1 Implement `formatIndianPrice`
    - Write `lib/utils/format.ts` with `formatIndianPrice(amount: number): string` using `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })`
    - _Requirements: 15.1, 15.2, 15.3_

  - [ ] 4.2 Write property test for `formatIndianPrice`
    - **Property 19: formatIndianPrice ₹ prefix** — for any non-negative integer, output starts with `₹`
    - **Validates: Requirements 15.2**

  - [x] 4.3 Implement `filterAndSortProducts`
    - Write `lib/utils/filter.ts` with `filterAndSortProducts(products, filters, sort)` matching the pseudocode in the design (brand, price range, rating, spec filters; all sort options)
    - Ensure original array is not mutated (spread before sort)
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [x] 4.4 Write property tests for `filterAndSortProducts`
    - **Property 12: subset correctness** — every returned product satisfies all active filters
    - **Property 13: immutability** — original array unchanged after call
    - **Property 14: idempotency** — applying same filter twice equals applying once
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

  - [x] 4.5 Implement `buildSpecDiffTable`
    - Write `lib/utils/compare.ts` with `buildSpecDiffTable(products: ProductDetail[]): SpecDiffRow[]` matching the pseudocode in the design
    - Exclude all-null rows; set `hasDiff` correctly; preserve `spec_template.fields` order
    - _Requirements: 5.4, 5.5, 5.6_

  - [x] 4.6 Write property tests for `buildSpecDiffTable`
    - **Property 6: hasDiff correctness** — `hasDiff = true` iff at least two products differ on that key
    - **Property 7: excludes all-null rows** — no row in output has all-null values
    - **Validates: Requirements 5.5, 5.6**

  - [x] 4.7 Implement `generateProductMetadata` and `generateProductJsonLd`
    - Write `lib/utils/seo.ts` with both functions matching the design's postconditions
    - `generateProductMetadata`: title format, OG image, canonical URL
    - `generateProductJsonLd`: `Product` schema with `offers` array, `aggregateRating`, optional `review`
    - _Requirements: 2.4, 2.7, 12.1, 12.2_

  - [x] 4.8 Write property tests for SEO utilities
    - **Property 17: generateProductMetadata title format** — title equals `"{name} Review & Price in India | {site_name}"`
    - **Property 18: generateProductJsonLd offers count** — `offers.length` equals `affiliateLinks.length`
    - **Validates: Requirements 2.7, 2.4, 12.1**

- [x] 5. Checkpoint — Ensure all utility tests pass
  - Run `vitest --run` and confirm all property and unit tests pass before proceeding.

- [ ] 6. Data fetching layer
  - [x] 6.1 Implement `fetchSiteConfig`
    - Write `lib/data/site-config.ts` with `fetchSiteConfig(): Promise<SiteConfig>` — fetches the single `site_config` row using the server Supabase client
    - _Requirements: 1.1_

  - [x] 6.2 Implement product data fetchers
    - Write `lib/data/products.ts` with:
      - `fetchProductDetail(categorySlug, productSlug): Promise<ProductDetail | null>` — joins `affiliate_links` (sorted by `price_inr` asc) and `faqs`, returns null if not found or `is_published = false`
      - `fetchProductsByCategory(categorySlug): Promise<ProductSummary[]>` — returns published products for a category
      - `fetchProductBySlug(slug): Promise<ProductDetail | null>`
      - `fetchFeaturedProducts(): Promise<ProductSummary[]>`
    - _Requirements: 2.1, 2.5, 2.6, 2.8, 3.1_

  - [x] 6.3 Implement category, brand, deal, and best-of-list fetchers
    - Write `lib/data/categories.ts` — `fetchAllCategories()`, `fetchCategoryBySlug(slug)`
    - Write `lib/data/deals.ts` — `fetchActiveDeals()` filtering `expires_at > now()` and `is_active = true`
    - Write `lib/data/best-of-lists.ts` — `fetchBestOfLists()`, `fetchBestOfListBySlug(slug)` returning items in ascending `rank` order
    - _Requirements: 10.3, 11.3, 11.4_

  - [x] 6.4 Implement `searchProducts`
    - Write `lib/data/search.ts` with `searchProducts(query, limit?)` using Supabase `textSearch` or `ilike` with `pg_trgm` across `name`, `tags`, `brand_name`, `category_name`
    - _Requirements: 7.2, 7.3, 7.5_

- [ ] 7. SiteConfig provider and root layout
  - [x] 7.1 Implement `SiteConfigProvider` context
    - Write `components/providers/SiteConfigProvider.tsx` — React context provider exposing `SiteConfig` to all client components
    - _Requirements: 1.6_

  - [x] 7.2 Wire root layout with SiteConfig
    - Update `app/layout.tsx` to call `fetchSiteConfig()`, inject `--color-primary` and `--color-secondary` on `<html>`, wrap children in `SiteConfigProvider`
    - Conditionally load Google AdSense script when `google_adsense_id` is present
    - Conditionally load Google Analytics script when `google_analytics_id` is present
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [x] 7.3 Write property test for CSS variable injection
    - **Property 1: CSS variable injection from SiteConfig** — rendered `<html>` contains `--color-primary` and `--color-secondary` matching `SiteConfig` values
    - **Validates: Requirements 1.2**

- [ ] 8. Shared UI components
  - [x] 8.1 Implement `ProductCard` component
    - Write `components/ui/ProductCard.tsx` — renders thumbnail (`<Image>`), name, brand, rating badge, `formatIndianPrice` price, deal badge when `is_deal_of_the_day` or `deal_badge_text` is set, link to `/[category_slug]/[slug]`, and "Compare" toggle button
    - _Requirements: 2.1, 2.3, 15.4_

  - [x] 8.2 Write property tests for `ProductCard`
    - **Property 2: ProductCard renders all required fields** — rendered HTML contains name, brand, rating, and `₹`-prefixed price
    - **Property 3: Deal badge visibility** — badge shown iff `is_deal_of_the_day = true` or `deal_badge_text` non-null
    - **Property 4: ProductCard link construction** — href equals `/{category_slug}/{slug}`
    - **Validates: Requirements 2.1, 2.3, 15.2**

  - [x] 8.3 Implement `BuySection` component
    - Write `components/ui/BuySection.tsx` — renders affiliate links sorted by `price_inr` ascending, marks lowest price with "best price" badge, uses `/go/[id]` hrefs (never raw `affiliate_url`), shows store name, store icon, price, and `last_updated`; sticky sidebar on desktop, sticky bottom bar on mobile
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.4 Write property tests for `BuySection`
    - **Property 9: BuySection sort order** — links rendered in ascending `price_inr` order
    - **Property 10: Affiliate links use internal /go/ URLs** — rendered hrefs are `/go/{id}`, not raw `affiliate_url`
    - **Validates: Requirements 6.1, 6.3**

  - [x] 8.5 Implement `SpecsTable` component
    - Write `components/ui/SpecsTable.tsx` — renders product specifications as a table using the category's `SpecTemplate` field labels and order
    - _Requirements: 2.1_

  - [x] 8.6 Implement `FAQAccordion` component
    - Write `components/ui/FAQAccordion.tsx` — accessible accordion rendering FAQ items
    - _Requirements: 2.1_

  - [x] 8.7 Implement `ProductGallery` component
    - Write `components/ui/ProductGallery.tsx` — image gallery using Next.js `<Image>` for all images
    - _Requirements: 13.1_

- [ ] 9. Public pages — Homepage and category pages
  - [x] 9.1 Implement homepage
    - Write `app/page.tsx` — server component fetching featured products and active deals; renders `ProductCard` grid and deals section
    - _Requirements: 2.1_

  - [x] 9.2 Implement category listing page
    - Write `app/[category]/page.tsx` — server component fetching all published products for the category; reads `brands`, `priceRange`, `rating`, `sort` from `searchParams`; calls `filterAndSortProducts`; renders `ProductCard` grid with filter/sort UI
    - Add `generateStaticParams` for all categories
    - _Requirements: 3.1, 3.8, 3.9, 12.6_

  - [x] 9.3 Implement product detail page
    - Write `app/[category]/[product]/page.tsx` — server component calling `fetchProductDetail`; calls `notFound()` on null; renders `ProductGallery`, `BuySection`, `SpecsTable`, `FAQAccordion`, YouTube embed when `youtube_video_url` set; injects JSON-LD script tag
    - Implement `generateMetadata` export calling `generateProductMetadata`
    - Add `generateStaticParams` for top products; configure ISR `revalidate = 60`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 12.5, 12.6_

- [ ] 10. Affiliate redirect route handler
  - [x] 10.1 Implement `/go/[id]` route handler
    - Write `app/go/[id]/route.ts` — GET handler calling `handleAffiliateRedirect(params.id, request)`
    - Write `lib/affiliate/redirect.ts` with `handleAffiliateRedirect`: look up link by ID, return 404 if not found, extract user-agent/referrer/IP, hash IP with SHA-256, fire-and-forget `click_logs` insert, return 302 to `affiliate_url`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 14.1, 14.2_

  - [x] 10.2 Write property tests for affiliate redirect
    - **Property 15: IP hash format** — `ip_hash` is 64-char lowercase hex, never equals raw IP
    - **Property 16: 302 response** — valid `affiliate_link_id` returns 302 with correct `Location` header
    - **Validates: Requirements 4.2, 4.3, 14.1**

- [ ] 11. Comparison engine
  - [x] 11.1 Implement `ComparisonEngine` state and hook
    - Write `lib/compare/engine.ts` with `useComparisonEngine()` hook managing `productIds` (max 4) in `localStorage` and URL params; expose `addProduct`, `removeProduct`, `clearAll`
    - _Requirements: 5.1, 5.2_

  - [x] 11.2 Write property test for comparison engine max-4 invariant
    - **Property 5: max-4 invariant** — `productIds.length` never exceeds 4 after any sequence of `addProduct` calls
    - **Validates: Requirements 5.1**

  - [x] 11.3 Write property test for comparison state round-trip
    - **Property 8: state round-trip** — product IDs persisted to `localStorage` and URL params are restored identically on reload
    - **Validates: Requirements 5.2**

  - [x] 11.4 Implement comparison page
    - Write `app/compare/[...slugs]/page.tsx` — parse slug string on `-vs-` separator, fetch each product, call `buildSpecDiffTable` client-side, render `ComparisonTable` with highlighted diff rows and quick verdict box
    - _Requirements: 5.3, 5.4, 5.7, 5.8, 13.5_

- [ ] 12. Search
  - [x] 12.1 Implement search UI and results page
    - Write `components/ui/SearchBar.tsx` — debounced (300ms) auto-suggest calling `searchProducts`; keyboard-accessible dropdown
    - Write `app/search/page.tsx` — full results page reading `q` from `searchParams`, calling `searchProducts`, rendering results grid
    - _Requirements: 7.1, 7.4, 7.5_

- [x] 13. Checkpoint — Ensure all public site tests pass
  - Run `vitest --run` and confirm all tests pass before starting admin panel.

- [x] 14. Next.js middleware — Admin auth guard
  - Write `middleware.ts` at project root — matches `/admin/*` paths, calls `supabase.auth.getUser()`, redirects to `/admin/login?redirectTo={pathname}` when no valid session, allows request through when session valid
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 14.1 Write property test for admin route authentication
    - **Property 24: Admin route authentication enforcement** — any unauthenticated request to `/admin/*` returns a redirect to `/admin/login`
    - **Validates: Requirements 8.1, 8.2**

- [x] 15. Admin panel — Login page
  - Write `app/admin/login/page.tsx` — email/password login form using Supabase Auth `signInWithPassword`; on success redirect to `redirectTo` param or `/admin/dashboard`
  - _Requirements: 8.2, 8.4_

- [ ] 16. Admin panel — Product management
  - [x] 16.1 Implement dynamic spec form component
    - Write `components/admin/DynamicSpecForm.tsx` — on category change, fetches `spec_template` and renders fields by type (`text`, `number`, `select`, `boolean`, `multiselect`) using `react-hook-form`; validates required fields on submit
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 16.2 Implement image upload to Supabase Storage
    - Write `lib/admin/storage.ts` with `uploadProductImage(file, path): Promise<string>` — uploads to authenticated-only bucket, returns public URL; throws on failure
    - _Requirements: 9.5, 9.6_

  - [x] 16.3 Implement product create/edit form page
    - Write `app/admin/products/new/page.tsx` and `app/admin/products/[id]/edit/page.tsx` — use `DynamicSpecForm`, image upload, `react-hook-form` + `zod` validation; enforce `is_published` guards (no affiliate links → block publish, no thumbnail → block publish); auto-generate slug from name if not provided
    - _Requirements: 9.5, 9.6, 9.7, 9.8, 9.10, 9.11, 9.12_

  - [x] 16.4 Write property tests for product validation
    - **Property 22: Published product affiliate link requirement** — any product with `is_published = true` has at least one `AffiliateLink`
    - **Property 23: Product creator_rating bounds** — `creator_rating` is always in [0.0, 10.0]
    - **Validates: Requirements 9.7, 9.11**

  - [x] 16.5 Implement product list page and bulk CSV import
    - Write `app/admin/products/page.tsx` — paginated product list with edit/delete/publish actions
    - Add CSV import handler: parse CSV rows, validate each row with `zod`, batch insert via Supabase
    - _Requirements: 9.9_

- [x] 17. Admin panel — Deals management
  - Write `app/admin/deals/page.tsx` and deal create/edit form — `zod` validation enforcing `deal_price_inr < original_price_inr`; display `expires_at` datetime picker; list active and expired deals
  - _Requirements: 10.1, 10.2, 10.5_

  - [x] 17.1 Write property test for deal price invariant
    - **Property 20: Deal price invariant** — `deal_price_inr < original_price_inr` for any persisted `Deal`
    - **Validates: Requirements 10.1**

  - [x] 17.2 Write property test for expired deals exclusion
    - **Property 21: Expired deals excluded from public queries** — no deal with past `expires_at` appears in public query results
    - **Validates: Requirements 10.3**

- [x] 18. Admin panel — Best-Of Lists management
  - Write `app/admin/best-of-lists/page.tsx` and list create/edit form — manage `BestOfList` with title, slug, description, cover image, display order, and `BestOfListItem` entries (rank, product reference, pick reason)
  - Write `app/best-of/[slug]/page.tsx` — public page rendering items in ascending `rank` order; hidden when `is_published = false`
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 19. Admin panel — Site config editor
  - Write `app/admin/site-config/page.tsx` — form to edit all `SiteConfig` fields with image upload for `logo_url`, `favicon_url`, `creator_photo_url`; save updates the single `site_config` row
  - _Requirements: 1.3_

- [x] 20. SEO — Sitemap and Open Graph
  - Write `app/sitemap.ts` — dynamic XML sitemap including all published product URLs (`/[category]/[slug]`) and category URLs (`/[category]`)
  - Ensure all public page layouts include Open Graph and Twitter Card metadata via Next.js `Metadata` API
  - _Requirements: 12.3, 12.4_

- [ ] 21. Performance and security hardening
  - [x] 21.1 Verify `Cache-Control` headers
    - Confirm `next.config.js` sets `Cache-Control: s-maxage=60, stale-while-revalidate=300` on all public routes via Vercel headers config
    - _Requirements: 12.5_

  - [x] 21.2 Verify code splitting
    - Confirm admin components are in `app/admin/` subtree only and not imported by any public page; run `next build` and inspect bundle analysis
    - _Requirements: 13.4_

  - [x] 21.3 Verify `SameSite=Lax` cookie configuration
    - Confirm Supabase SSR client is configured with `SameSite=Lax` cookie options in `middleware.ts` and server client
    - _Requirements: 14.4_

  - [ ] 21.4 Verify Supabase Storage bucket policy
    - Confirm storage bucket policy allows public read and restricts write to authenticated admin sessions only
    - _Requirements: 14.5_

- [x] 22. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` and confirm all unit, property, and integration tests pass.
  - Verify `next build` completes without type errors.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check`; unit/component tests use `vitest` + `@testing-library/react`
- Supabase local dev (`supabase start`) is required for integration tests
- All price displays must use `formatIndianPrice` — never raw number formatting
