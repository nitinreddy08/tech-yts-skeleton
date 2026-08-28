# Implementation Plan: UI Redesign

## Overview

Incremental frontend-only redesign of the Next.js tech affiliate platform. Backend, data-fetching, and types are untouched. Each task builds on the previous, ending with all components wired into pages and the admin panel.

## Tasks

- [x] 1. Install dependencies
  - Run `npm install framer-motion @radix-ui/react-accordion embla-carousel-react lucide-react` (skip any already present)
  - Verify imports resolve in TypeScript
  - _Requirements: 1.1, 14.1_

- [ ] 2. Design system foundation
  - [x] 2.1 Replace `app/globals.css` with design tokens, `@theme` block, shimmer keyframe, and `.no-scrollbar` utility
    - Define CSS custom properties: `--color-primary`, `--color-accent`, `--color-surface`, `--color-surface-alt`, `--color-surface-admin`, `--color-border`, `--color-muted`
    - Expose all tokens to Tailwind via `@theme inline { ... }` block
    - Define `--shadow-sm`, `--shadow-md`, `--radius-card`, `--radius-card-lg`
    - Add `@keyframes shimmer` and `.shimmer` class
    - Set body defaults: `background-color: var(--color-surface)`, `color: var(--color-primary)`, `-webkit-font-smoothing: antialiased`
    - Remove all dark-mode rules and `@media (prefers-color-scheme: dark)` block
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.8_

  - [x] 2.2 Update `app/layout.tsx` — font setup, remove dark class, add Navbar/Footer shell
    - Import `Geist` (heading, `--font-geist-sans`) and `Inter` (body, `--font-inter`) from `next/font/google`
    - Set `html` className to include both font variables; remove `dark` class
    - Remove dynamic inline `--color-primary`/`--color-secondary` style attributes
    - Add `<Navbar />` and `<Footer />` stubs (import from `components/ui/`) wrapping `{children}`
    - _Requirements: 1.3, 1.4, 2.1_

  - [x] 2.3 Create `lib/utils/motion.ts` — shared framer-motion animation variants
    - Export `fadeInUp`, `fadeIn`, `staggerContainer` variant objects
    - _Requirements: 14.3, 14.4_

- [ ] 3. New global components
  - [x] 3.1 Create `components/ui/EmptyState.tsx`
    - Accept props: `icon: LucideIcon`, `heading: string`, `description: string`, `action?: { label, href?, onClick? }`
    - Render icon at 48px with `text-muted`, heading with `text-primary`, description with `text-muted`
    - Center content with `py-16` minimum vertical padding
    - Render optional action as `<Link>` or `<button>` with accent styling
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 3.2 Write property test for EmptyState
    - **Property 19: EmptyState renders all props with correct token styling**
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4**
    - Create `components/ui/__tests__/EmptyState.test.tsx`

  - [x] 3.3 Create `components/ui/LoadingSkeleton.tsx`
    - Export `ProductCardSkeleton` — matches ProductCard dimensions with shimmer divs for image, brand, name lines, price
    - Export `TableRowSkeleton` — matches admin table row with shimmer divs
    - Use `.shimmer` CSS class from globals.css; no spinner icons
    - _Requirements: 14.5, 14.6_

  - [x] 3.4 Create `components/ui/CategoryPills.tsx`
    - Accept props: `categories: Category[]`, `activeSlug?: string`
    - Render horizontally scrollable row with `.no-scrollbar`; pill height ≥ 36px, horizontal padding 16px
    - Map `cat.icon` string to Lucide component via `CATEGORY_ICON_MAP` (fallback: `Tag`)
    - Active pill: `border-accent bg-accent/5 text-accent`; default: `border-border bg-surface text-primary`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.5 Write property test for CategoryPills
    - **Property 21: CategoryPills render icon and name for every category**
    - **Validates: Requirements 4.2**
    - Create `components/ui/__tests__/CategoryPills.test.tsx`

  - [x] 3.6 Create `components/ui/AffiliateButton.tsx`
    - Accept props: `link: AffiliateLink`, `isBestPrice?: boolean`, `size?: 'sm' | 'md' | 'lg'`
    - Render `<Link href="/go/${link.id}">` with Lucide `ShoppingCart` icon, `store_name`, formatted `price_inr`
    - `isBestPrice=true`: `bg-accent text-white`; default: `bg-surface border border-border text-primary`
    - Apply `active:scale-[0.98] transition-transform duration-100`; no emoji characters
    - _Requirements: 7.4, 16.2_

  - [x] 3.7 Write property test for AffiliateButton
    - **Property 6: AffiliateButton content completeness**
    - **Validates: Requirements 7.4**
    - Create `components/ui/__tests__/AffiliateButton.test.tsx`

  - [x] 3.8 Create `components/ui/CompareBar.tsx`
    - Accept props: `products: ProductSummary[]`, `onRemove: (id: string) => void`, `onClear: () => void`
    - Render as `fixed bottom-0` bar with `bg-surface border-t border-border shadow-md`
    - Wrap in `<AnimatePresence>`; mount only when `products.length >= 2`
    - Animate in/out with `y: 80 → 0` spring; animate item removal with `exit={{ opacity:0, scale:0.8 }}`
    - Include "Compare Now" `<Link>` to `/compare/[slugs]` and "Clear" button
    - _Requirements: 9.6, 9.7, 9.8_

  - [x] 3.9 Write property test for CompareBar
    - **Property 12: CompareBar visibility threshold**
    - **Validates: Requirements 9.6**
    - Create `components/ui/__tests__/CompareBar.test.tsx`

  - [x] 3.10 Create `components/ui/Navbar.tsx`
    - Client component; read `SiteConfig` via context
    - Sticky header: `sticky top-0 z-50 bg-white/85 backdrop-blur-md`; height 64px; horizontal padding 16px
    - Scroll border logic: `useEffect` + `window.addEventListener('scroll')` → toggle `border-b border-border`
    - Left: logo/site name; center: `<SearchBar />` (hidden on mobile); right: nav links + compare icon + mobile menu button
    - Mobile drawer: slide-in with `<AnimatePresence>`, triggered by Lucide `Menu` icon; close with `X` icon
    - All icons from `lucide-react`; touch targets ≥ 44×44px
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 3.11 Write property test for Navbar scroll border
    - **Property 11: Navbar scroll border toggle**
    - **Validates: Requirements 2.3**

  - [x] 3.12 Create `components/ui/Footer.tsx`
    - `bg-surface-alt border-t border-border`; 3-column grid on desktop
    - Col 1: site name + tagline; Col 2: nav links; Col 3: social links with Lucide icons
    - Bottom strip: `footer_text` from SiteConfig, `text-xs text-muted text-center`
    - _Requirements: 6.7_

- [x] 4. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Redesign existing UI components
  - [x] 5.1 Redesign `components/ui/ProductCard.tsx`
    - Background `bg-surface`, border `border border-border`, shadow `shadow-[var(--shadow-sm)]`, radius `rounded-[var(--radius-card)]`
    - Image area: `bg-surface-alt aspect-square`; fallback: Lucide `Package` icon (no emoji)
    - Brand: `text-xs text-muted`; name: `text-sm font-semibold text-primary line-clamp-2`; price: `text-base font-bold text-accent`
    - DealBadge: `bg-accent text-white` absolute badge — no emoji text
    - Hover: `hover:scale-[1.01] transition-transform duration-200 ease-out`
    - Compare button: Lucide `GitCompare` icon; info section padding `p-6`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10_

  - [x] 5.2 Write property tests for ProductCard
    - **Property 3: ProductCard content structure**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.9**
    - **Property 4: DealBadge renders for all flagged products**
    - **Validates: Requirements 5.7**
    - Update `components/ui/__tests__/ProductCard.test.tsx`

  - [x] 5.3 Write property test for no-emoji constraint
    - **Property 1: No emoji characters in rendered UI**
    - **Validates: Requirements 1.7, 2.5, 13.3, 16.2**
    - Add to `components/ui/__tests__/ProductCard.test.tsx` (covers ProductCard; extend to other components as they are built)

  - [x] 5.4 Redesign `components/ui/BuySection.tsx`
    - Container: `rounded-[var(--radius-card-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]`
    - Replace each row with `<AffiliateButton>` component; sort links by `price_inr` ascending (nulls last)
    - Lowest-price button: `isBestPrice` prop → `bg-accent` highlight
    - Remove all emoji store icons
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 5.5 Write property test for BuySection
    - **Property 5: BuySection sort and highlight invariant**
    - **Validates: Requirements 7.3**
    - Update `components/ui/__tests__/BuySection.test.tsx`

  - [x] 5.6 Redesign `components/ui/SearchBar.tsx`
    - Input: `rounded-full border border-border px-4 py-2 pl-10 text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none`
    - Left icon: Lucide `Search` at `left-3 top-1/2 -translate-y-1/2 text-muted`
    - Clear button: Lucide `X` shown when `query.length > 0`
    - Dropdown: `bg-surface border border-border rounded-[var(--radius-card)] shadow-[var(--shadow-md)]`; max 8 results
    - Suggestion item: product name, category slug, thumbnail
    - Empty dropdown: `<EmptyState icon={SearchX} heading="No results" description="..." />`
    - Close on Escape or outside click; navigate to product page on selection
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 5.7 Write property tests for SearchBar
    - **Property 9: SearchBar suggestion count limit**
    - **Validates: Requirements 3.2**
    - **Property 10: SearchBar suggestion item completeness**
    - **Validates: Requirements 3.3**
    - Create/update `components/ui/__tests__/SearchBar.test.tsx`

  - [x] 5.8 Redesign `components/ui/ProductGallery.tsx`
    - Apply design tokens: `bg-surface-alt` image area, `rounded-[var(--radius-card-lg)]` container
    - Thumbnail strip: `border border-border` active indicator, `bg-surface` background
    - _Requirements: 1.1, 16.1_

  - [x] 5.9 Redesign `components/ui/SpecsTable.tsx`
    - Alternating row backgrounds: even rows `bg-surface`, odd rows `bg-surface-alt`
    - No two adjacent rows share the same background
    - Remove any dark styling; apply `border border-border` table wrapper
    - _Requirements: 7.5_

  - [x] 5.10 Write property test for SpecsTable alternating rows
    - **Property 7: Alternating row backgrounds in tables**
    - **Validates: Requirements 7.5, 13.5**

  - [x] 5.11 Redesign `components/ui/FAQAccordion.tsx`
    - Replace existing implementation with Radix UI `@radix-ui/react-accordion` primitives
    - Smooth height animation via `data-[state=open]:animate-accordion-down` or CSS `grid-template-rows` transition
    - Apply design tokens: `border-border`, `text-primary`, `text-muted`
    - _Requirements: 7.6_

- [x] 6. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Redesign public pages
  - [x] 7.1 Redesign `app/page.tsx` — Homepage
    - Hero: `bg-surface-alt py-20 px-4 text-center`; `<h1>` font-heading, tagline `<p>`, `<SearchBar />` centered
    - CategoryPills row below hero with `border-b border-border`
    - Deal of the Day banner: conditional, `bg-accent/4 border border-accent/10`, Lucide `Zap` icon — no fire emoji
    - Featured products grid: 4 cols desktop / 2 cols mobile
    - Best-Of preview: up to 3 cards, `bg-surface-alt` section
    - Latest reviews grid: 4 cols desktop / 2 cols mobile
    - EmptyState (`Package` icon) when no products
    - Wrap each section in `<motion.section whileInView="visible" variants={fadeInUp} viewport={{ once: true }}>`
    - All sections: minimum `py-20` vertical padding; no dark backgrounds
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

  - [x] 7.2 Write property tests for Homepage
    - **Property 22: Homepage Best-Of preview cap**
    - **Validates: Requirements 6.6**
    - **Property 23: Deal of the Day banner conditional render**
    - **Validates: Requirements 6.4**
    - **Property 2: No dark background classes on public pages**
    - **Validates: Requirements 1.8, 16.1**
    - Create `app/__tests__/homepage.test.tsx`

  - [x] 7.3 Redesign `app/[category]/page.tsx` — Category Page
    - Page header: `bg-surface-alt rounded-[var(--radius-card-lg)] p-6 mb-8`; Lucide icon (40px), name, description, count
    - Filter sidebar: `w-56 shrink-0 rounded-[var(--radius-card)] border border-border bg-surface p-4` on desktop; collapsible drawer on mobile (Lucide `SlidersHorizontal` trigger)
    - Sort `<select>`, brand checkboxes, price range inputs, min rating radio group
    - Product grid: 3 cols desktop / 2 cols mobile
    - EmptyState with `SearchX` icon and "Clear Filters" action when filtered result is empty
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 7.4 Redesign `app/[category]/[product]/page.tsx` — Product Detail Page
    - Two-column layout: `grid gap-8 lg:grid-cols-[1fr_360px]`
    - Breadcrumb: `text-sm text-muted` with Lucide `ChevronRight` separators
    - Left: `<ProductGallery />`, pros/cons grid (Lucide `CheckCircle` green / `XCircle` red), YouTube embed `aspect-video rounded-[var(--radius-card-lg)]`, `<SpecsTable />`, `<FAQAccordion />`, Similar Products `<EmblaCarousel>`
    - Right sticky (`sticky top-20`): brand/name/tagline, rating badge (`bg-primary text-white`), `<BuySection />`, compare CTA with Lucide `GitCompare`
    - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_

  - [x] 7.5 Write property tests for Product Detail
    - **Property 8: Pros use CheckCircle, cons use XCircle**
    - **Validates: Requirements 7.10**

  - [x] 7.6 Redesign `app/search/page.tsx` — Search Page
    - Heading: query in `<mark className="bg-accent/10 text-accent px-1 rounded">`, result count in `text-muted`
    - Results grid: 4 cols desktop / 2 cols mobile; highlight matched term in product name via `<mark>`
    - EmptyState with `SearchX` icon and "Browse Categories" action when no results
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 7.7 Write property test for Search Page
    - **Property 15: Search results query term highlighting**
    - **Validates: Requirements 10.5**

  - [x] 7.8 Redesign `app/best-of/[slug]/page.tsx` — Best-Of List Page
    - Editorial header: full-width cover image `rounded-[var(--radius-card-lg)]`, `<h1>` font-heading, description
    - ToC sidebar: `hidden lg:block w-48 sticky top-20`; `IntersectionObserver` updates active item
    - Each ranked item: `<article>` with rank number `text-3xl font-bold text-accent` (numeric only, no emoji), thumbnail, brand, name, pick_reason, `<AffiliateButton />`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 7.9 Write property test for Best-Of rank numbers
    - **Property 16: Best-Of rank numbers in accent color**
    - **Validates: Requirements 11.2, 11.3**

  - [x] 7.10 Redesign `app/compare/[...slugs]/page.tsx` — Comparison Page
    - Heading: "{product1} vs {product2} [vs ...]" in font-heading
    - Product header row: grid with 200px first col; each product col `rounded-[var(--radius-card)] border border-border bg-surface p-4`
    - CompareTable: `overflow-x-auto rounded-[var(--radius-card)] border border-border`; sticky first column; alternating row backgrounds; winning value: `text-accent` + Lucide `Trophy` icon
    - Verdict section: `bg-surface-alt border border-border rounded-[var(--radius-card-lg)] p-6`; recommended ProductCard
    - Wire `<CompareBar />` as client component reading compare state; enforce max 4 products
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

  - [x] 7.11 Write property tests for Comparison Page
    - **Property 13: Comparison page enforces max 4 products**
    - **Validates: Requirements 9.1**
    - **Property 14: CompareTable winning value highlight**
    - **Validates: Requirements 9.4**

- [x] 8. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 9. New Deals page
  - [x] 9.1 Create `app/deals/page.tsx`
    - Fetch active deals using existing `lib/data/deals.ts`
    - Page heading: `font-heading text-3xl font-bold text-primary`
    - Deal of the Day hero: `bg-surface-alt border border-border rounded-[var(--radius-card-lg)] p-6 md:p-8 mb-12`; Lucide `Zap` label, product image (160px), deal price `text-3xl font-bold text-accent`, original price struck through, discount %, `<AffiliateButton isBestPrice />`, countdown timer with Lucide `Clock` when `expires_at` non-null
    - Price Drops grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`; each card with Lucide `TrendingDown` icon, discount %, `<AffiliateButton />`
    - EmptyState with Lucide `Tag` icon when no active deals
    - No dark backgrounds
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 9.2 Write property tests for Deals page
    - **Property 17: Deals page shows all active price_drop deals**
    - **Validates: Requirements 12.3**
    - **Property 18: Deal card discount display**
    - **Validates: Requirements 12.4**
    - Create `app/__tests__/deals.test.tsx`

- [ ] 10. Redesign Admin panel
  - [x] 10.1 Redesign `app/admin/layout.tsx` — light-theme sidebar
    - Outer: `flex min-h-screen bg-surface-admin`
    - Sidebar: `hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-surface`
    - Nav items with Lucide icons: `LayoutDashboard`, `Package`, `Zap`, `Trophy`, `Settings`; each link `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-alt hover:text-primary`
    - Footer: sign-out button with Lucide `LogOut`; no emojis
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 10.2 Redesign `app/admin/page.tsx` — Admin Dashboard
    - Stat cards: `rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-sm)] p-5`; Lucide icon per metric
    - Quick actions grid: `rounded-[var(--radius-card)] border border-border bg-surface p-4 hover:bg-surface-alt`; Lucide `text-accent` icons
    - No dark backgrounds
    - _Requirements: 13.1, 13.4_

  - [x] 10.3 Write property test for Admin Panel no-dark constraint
    - **Property 2: No dark background classes on public pages** (extended to admin)
    - **Validates: Requirements 13.1, 16.1**

  - [x] 10.4 Redesign `app/admin/login/page.tsx` — Login Page
    - Centered card on `bg-surface-alt` full-screen background
    - Card: `bg-surface rounded-[var(--radius-card-lg)] border border-border shadow-[var(--shadow-md)] p-8`
    - No dark styling; use design token inputs
    - _Requirements: 13.9_

- [ ] 11. Property-based test arbitraries and remaining properties
  - [x] 11.1 Create `components/ui/__tests__/arbitraries.ts`
    - Define `fast-check` arbitraries: `arbitraryProductSummary()`, `arbitraryAffiliateLink()`, `arbitraryDeal()`, `arbitraryCategory()`, `arbitraryBestOfListItem()`
    - Each arbitrary generates valid objects matching types from `types/index.ts`
    - _Requirements: all_

  - [x] 11.2 Write property test for max-w-7xl content width
    - **Property 20: All pages use max-w-7xl content width**
    - **Validates: Requirements 16.6**

- [x] 12. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All icon usage must be from `lucide-react` — no emojis anywhere in the UI
- Backend files (`lib/**`, `types/index.ts`, `app/api/**`, `supabase/**`) must not be modified
- Property tests use `fast-check` with `numRuns: 100` minimum; tag each file with `// Feature: ui-redesign, Property N: ...`
- `components/admin/**` forms inherit design tokens automatically via globals.css; no structural changes needed unless explicitly listed
