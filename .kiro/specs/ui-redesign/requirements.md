# Requirements Document

## Introduction

This spec covers a complete visual/frontend redesign of an existing Next.js tech affiliate platform. The backend (Supabase, server actions, data-fetching functions) is fully working and must not be changed. Only the UI layer — pages, components, layout, typography, color, spacing, and animation — is in scope.

The new aesthetic is luxury-minimal: clean white surfaces, generous whitespace, precise typography, and subtle motion. Reference points are Apple.com, Anthropic.com, Vercel, and Linear. The result must feel premium and editorial, not cluttered or dark.

---

## Glossary

- **Platform**: The Next.js tech affiliate website being redesigned.
- **Design_System**: The shared set of Tailwind tokens, CSS variables, and component primitives that enforce the visual language across all pages.
- **Navbar**: The sticky top navigation bar present on every public page.
- **ProductCard**: The reusable card component used in grids and carousels to represent a single product summary.
- **AffiliateButton**: The CTA button that routes the user through `/go/[id]` to an external store.
- **CompareBar**: The fixed bottom bar that appears when the user has selected products for comparison.
- **CategoryPills**: The horizontal scrollable row of category filter chips.
- **SearchBar**: The global search input with live suggestion dropdown.
- **EmptyState**: The component shown when a list or grid has no items to display.
- **LoadingSkeleton**: The animated placeholder shown while async content is loading.
- **Admin_Panel**: The password-protected `/admin` section used to manage content.
- **Sidebar**: The left navigation panel inside the Admin_Panel.
- **SpecTable**: The structured table of product technical specifications.
- **FAQAccordion**: The expandable question-and-answer section on the product detail page.
- **BuySection**: The sticky sidebar panel listing affiliate purchase links sorted by price.
- **DealBadge**: The label overlaid on a ProductCard to indicate a deal or price drop.
- **CompareTable**: The sticky horizontal spec comparison table on the comparison page.
- **BestOfList**: An editorially curated ranked list of products in a category.
- **Verdict**: The editorial summary section at the bottom of a comparison page.
- **framer-motion**: The animation library used for page transitions and micro-interactions.
- **Lucide**: The `lucide-react` icon library; the only icon source permitted.

---

## Requirements

### Requirement 1: Design System Foundation

**User Story:** As a developer, I want a single source of truth for all visual tokens, so that every component uses consistent colors, spacing, typography, and shadows without duplication.

#### Acceptance Criteria

1. THE Design_System SHALL define CSS custom properties for the following color tokens: `--color-primary: #111111`, `--color-accent: #0066FF`, `--color-surface: #FFFFFF`, `--color-surface-alt: #F9F9F7`, `--color-border: #E5E5E5`, `--color-muted: #6B7280`.
2. THE Design_System SHALL expose all color tokens to Tailwind via the `@theme` block in `globals.css` so they are usable as utility classes (e.g., `bg-surface`, `text-accent`).
3. THE Design_System SHALL configure Geist or Plus Jakarta Sans as the heading font and Inter as the body font via `next/font/google`, with CSS variables `--font-heading` and `--font-body`.
4. THE Design_System SHALL remove all dark-mode CSS rules, including the `@media (prefers-color-scheme: dark)` block and the `dark` class on the `<html>` element.
5. THE Design_System SHALL define a shadow scale: `--shadow-sm: 0 1px 3px rgba(0,0,0,0.06)` and `--shadow-md: 0 4px 16px rgba(0,0,0,0.04)`.
6. THE Design_System SHALL define border-radius tokens: `--radius-card: 12px` and `--radius-card-lg: 16px`.
7. IF a component currently uses an emoji as an icon, THEN THE Design_System SHALL replace it with the equivalent Lucide icon component.
8. THE Design_System SHALL set `background-color: var(--color-surface)` and `color: var(--color-primary)` as the default body styles, replacing the existing dark defaults.

---

### Requirement 2: Navbar

**User Story:** As a visitor, I want a clean sticky navigation bar, so that I can always access search, categories, and key links without scrolling back to the top.

#### Acceptance Criteria

1. THE Navbar SHALL be sticky at the top of the viewport with `position: sticky; top: 0` and a z-index above all page content.
2. THE Navbar SHALL have a white background (`var(--color-surface)`) with `backdrop-filter: blur(12px)` and `background-color: rgba(255,255,255,0.85)` to create a frosted effect on scroll.
3. THE Navbar SHALL render a bottom border using `var(--color-border)` that becomes visible only when the page has been scrolled more than 0px.
4. THE Navbar SHALL render the site logo or name on the left, the SearchBar in the center, and navigation links plus a compare icon on the right.
5. THE Navbar SHALL use only Lucide icons for all icon slots (search, compare, menu) — no emojis.
6. WHEN the viewport width is below 768px, THE Navbar SHALL collapse navigation links into a slide-in drawer triggered by a Lucide `Menu` icon.
7. THE Navbar SHALL have a minimum height of 64px and internal horizontal padding of 16px on each side.

---

### Requirement 3: SearchBar

**User Story:** As a visitor, I want a fast search experience with live suggestions, so that I can find products without navigating through categories.

#### Acceptance Criteria

1. THE SearchBar SHALL render as a rounded input field with a Lucide `Search` icon on the left and a Lucide `X` clear button on the right when the input is non-empty.
2. WHEN the user types at least 2 characters, THE SearchBar SHALL display a dropdown of up to 8 live suggestions fetched from the existing `/api/search` route.
3. THE SearchBar dropdown SHALL show product name, category, and thumbnail for each suggestion.
4. WHEN the user presses the Escape key or clicks outside the dropdown, THE SearchBar SHALL close the dropdown and retain the current input value.
5. WHEN the user selects a suggestion, THE SearchBar SHALL navigate to the corresponding product detail page.
6. THE SearchBar dropdown SHALL have a white background, `var(--shadow-md)` shadow, and `var(--radius-card)` border radius.
7. IF the search returns no results, THEN THE SearchBar SHALL display an EmptyState message inside the dropdown.

---

### Requirement 4: CategoryPills

**User Story:** As a visitor, I want to quickly filter by category, so that I can browse products relevant to my interest without using the full navigation.

#### Acceptance Criteria

1. THE CategoryPills SHALL render as a horizontally scrollable row of pill-shaped buttons with no visible scrollbar.
2. EACH pill SHALL display a Lucide icon (mapped from the category's `icon` field) and the category name.
3. THE CategoryPills SHALL use `var(--color-border)` for the default border, `var(--color-surface)` for the default background, and `var(--color-accent)` border and background tint for the active/selected state.
4. WHEN a pill is clicked, THE CategoryPills SHALL update the active state and navigate to the corresponding category page.
5. THE CategoryPills SHALL have a minimum pill height of 36px and horizontal padding of 16px per pill.

---

### Requirement 5: ProductCard

**User Story:** As a visitor, I want product cards that clearly communicate brand, name, key spec, price, and actions, so that I can evaluate products at a glance.

#### Acceptance Criteria

1. THE ProductCard SHALL have a white (`var(--color-surface)`) background, `var(--shadow-sm)` shadow, `var(--radius-card)` border radius, and a `1px solid var(--color-border)` border.
2. THE ProductCard SHALL display the brand name in `var(--color-muted)` above the product name.
3. THE ProductCard SHALL display the product name as a two-line-clamped heading in `var(--color-primary)`.
4. THE ProductCard SHALL display the current price in `var(--color-accent)` as the most visually prominent text element in the info section.
5. THE ProductCard SHALL include a "Compare" button using a Lucide `GitCompare` icon and a "View Details" CTA link.
6. WHEN the ProductCard is hovered, THE ProductCard SHALL apply `transform: scale(1.01)` with a 200ms ease-out transition.
7. IF a product has a `deal_badge_text` or `is_deal_of_the_day` flag, THEN THE ProductCard SHALL render a DealBadge using `var(--color-accent)` background — no emojis.
8. THE ProductCard SHALL have a minimum card padding of 24px in the info section.
9. IF a product has no `thumbnail_url`, THEN THE ProductCard SHALL render a Lucide `Package` icon as a placeholder — no emoji fallback.
10. THE ProductCard image area SHALL have a `var(--color-surface-alt)` background.

---

### Requirement 6: Homepage

**User Story:** As a visitor, I want a well-structured homepage, so that I can immediately understand the platform's value and discover featured products, deals, and curated lists.

#### Acceptance Criteria

1. THE Homepage SHALL open with a hero section containing a centered headline, a subheadline from `config.tagline`, and the SearchBar as the primary interactive element.
2. THE Homepage hero section SHALL have a minimum vertical padding of 80px and a white or `var(--color-surface-alt)` background — no dark gradients.
3. THE Homepage SHALL render CategoryPills immediately below the hero section.
4. THE Homepage SHALL render a "Deal of the Day" banner when a deal of type `deal_of_day` exists, using a light accent-tinted background (`rgba(0,102,255,0.04)`) and a Lucide `Zap` icon — no fire emoji.
5. THE Homepage SHALL render a featured products grid with a minimum of 4 columns on desktop (>=1024px) and 2 columns on mobile.
6. THE Homepage SHALL render a "Best Of" preview section showing up to 3 BestOfList cards with title, description, and item count.
7. THE Homepage SHALL render a footer with site name, navigation links, and social links using Lucide icons.
8. EACH section on the Homepage SHALL have a minimum vertical padding of 80px between sections.
9. THE Homepage SHALL use framer-motion `fadeIn` variants for section entrance animations triggered on scroll via `whileInView`.

---

### Requirement 7: Product Detail Page

**User Story:** As a visitor, I want a detailed product page, so that I can read specs, watch a review, compare prices, and click through to buy with confidence.

#### Acceptance Criteria

1. THE Product_Detail_Page SHALL use a two-column layout on desktop (>=1024px): left column for gallery, pros/cons, description, specs, and FAQ; right column for the sticky BuySection.
2. THE BuySection SHALL be sticky within the right column with `position: sticky; top: 80px` so it remains visible while the user scrolls the left column.
3. THE BuySection SHALL list AffiliateButtons sorted by price ascending, with the lowest-price option visually highlighted using `var(--color-accent)` background.
4. EACH AffiliateButton SHALL use a Lucide `ShoppingCart` icon and display the store name and price — no emoji store icons.
5. THE Product_Detail_Page SHALL render a SpecTable with alternating row backgrounds using `var(--color-surface)` and `var(--color-surface-alt)`.
6. THE Product_Detail_Page SHALL render a FAQAccordion using Radix UI `Accordion` primitives with smooth height animation.
7. WHEN a `youtube_video_url` is present, THE Product_Detail_Page SHALL embed the video in a 16:9 aspect-ratio container with `var(--radius-card-lg)` border radius.
8. THE Product_Detail_Page SHALL render a "Similar Products" horizontal carousel using `embla-carousel-react` at the bottom of the page.
9. THE Product_Detail_Page SHALL render a breadcrumb navigation using Lucide `ChevronRight` separators.
10. THE Product_Detail_Page pros section SHALL use a Lucide `CheckCircle` icon in green; the cons section SHALL use a Lucide `XCircle` icon in red — no text symbols or emojis.

---

### Requirement 8: Category Page

**User Story:** As a visitor, I want to browse all products in a category with filtering and sorting, so that I can narrow down to the product that fits my needs.

#### Acceptance Criteria

1. THE Category_Page SHALL render a filter sidebar on the left on desktop (>=1024px) and a collapsible filter drawer on mobile.
2. THE Category_Page filter sidebar SHALL support filtering by brand (checkbox list), price range (dual-handle slider), and minimum creator rating.
3. THE Category_Page SHALL render a product grid to the right of the sidebar with a minimum of 3 columns on desktop and 2 on mobile.
4. THE Category_Page SHALL render sort controls (dropdown) above the product grid with options: Price Low-High, Price High-Low, Highest Rated, Newest.
5. WHEN filters are applied, THE Category_Page SHALL update the product grid without a full page reload using URL search params and React state.
6. IF the filtered result set is empty, THEN THE Category_Page SHALL render an EmptyState component with a Lucide `SearchX` icon and a "Clear Filters" action.
7. THE Category_Page SHALL display the category name, icon, and description in a page header with `var(--color-surface-alt)` background.

---

### Requirement 9: Comparison Page

**User Story:** As a visitor, I want to compare up to 4 products side by side, so that I can identify the best option for my budget and requirements.

#### Acceptance Criteria

1. THE Comparison_Page SHALL render a product selector at the top allowing the user to add up to 4 products by name search.
2. THE Comparison_Page SHALL render a CompareTable with the first column as spec labels and subsequent columns as product values.
3. THE CompareTable SHALL be sticky horizontally so the spec label column remains visible when scrolling right on narrow viewports.
4. WHEN a spec value differs between products, THE CompareTable SHALL highlight the winning value using `var(--color-accent)` text and a Lucide `Trophy` icon.
5. THE Comparison_Page SHALL render a Verdict section below the CompareTable with an editorial summary and a recommended product card.
6. THE CompareBar SHALL appear as a fixed bottom bar when 2 or more products are selected anywhere on the Platform, showing product thumbnails and a "Compare Now" CTA.
7. THE CompareBar SHALL use `var(--color-surface)` background, `var(--shadow-md)` shadow, and a `1px solid var(--color-border)` top border.
8. WHEN a product is removed from the CompareBar, THE CompareBar SHALL animate the removal using framer-motion `AnimatePresence`.

---

### Requirement 10: Search Page

**User Story:** As a visitor, I want a dedicated search results page, so that I can see all matching products in a browsable grid after submitting a query.

#### Acceptance Criteria

1. THE Search_Page SHALL display the current query in a heading and the total result count.
2. THE Search_Page SHALL render results in a product grid consistent with the Category_Page grid layout.
3. WHEN the query changes via URL param, THE Search_Page SHALL re-fetch and re-render results using the existing `/api/search` route.
4. IF no results are found, THEN THE Search_Page SHALL render an EmptyState with a Lucide `SearchX` icon and suggested categories.
5. THE Search_Page SHALL highlight the matched query term within each result's product name using a `<mark>` element styled with `var(--color-accent)` background at low opacity.

---

### Requirement 11: Best-Of Lists Page

**User Story:** As a visitor, I want to read curated best-of lists, so that I can get expert recommendations without having to compare products myself.

#### Acceptance Criteria

1. THE BestOf_Page SHALL render a full-width editorial header with the list title, description, and cover image.
2. THE BestOf_Page SHALL render each ranked product as a numbered card with the rank number displayed in `var(--color-accent)`, the product name, pick reason, rating, and an AffiliateButton.
3. THE BestOf_Page rank numbers SHALL be rendered using a styled numeric element — no emoji trophies or medals.
4. THE BestOf_Page SHALL render a table of contents sidebar on desktop (>=1024px) linking to each ranked item by anchor.
5. WHEN the user scrolls past a ranked item, THE BestOf_Page SHALL update the active item in the table of contents sidebar using an `IntersectionObserver`.

---

### Requirement 12: Deals Page

**User Story:** As a visitor, I want to see all active deals in one place, so that I can quickly find the best prices available right now.

#### Acceptance Criteria

1. THE Deals_Page SHALL render a hero banner for the Deal of the Day with product image, headline, deal price, original price, discount percentage, and an AffiliateButton.
2. THE Deals_Page hero banner SHALL use a `var(--color-surface-alt)` background with an accent-colored price — no dark backgrounds.
3. THE Deals_Page SHALL render a "Price Drops" grid below the hero showing all active deals of type `price_drop`.
4. EACH deal card in the grid SHALL display the discount percentage using a Lucide `TrendingDown` icon and `var(--color-accent)` text.
5. THE Deals_Page SHALL display a countdown timer for deals with a non-null `expires_at` value, using a Lucide `Clock` icon.
6. IF no active deals exist, THEN THE Deals_Page SHALL render an EmptyState with a Lucide `Tag` icon.

---

### Requirement 13: Admin Panel

**User Story:** As an admin, I want a clean, light-themed admin interface, so that I can manage products, deals, and site configuration without visual fatigue.

#### Acceptance Criteria

1. THE Admin_Panel SHALL use a white (`var(--color-surface)`) background for all pages — no dark backgrounds.
2. THE Sidebar SHALL be white with a `1px solid var(--color-border)` right border and a fixed width of 224px on desktop.
3. THE Sidebar SHALL use Lucide icons for all navigation items: `LayoutDashboard`, `Package`, `Tag`, `Zap`, `Trophy`, `Settings`, `LogOut` — no emojis.
4. THE Admin_Panel dashboard SHALL display stat cards with a white background, `var(--shadow-sm)` shadow, and a Lucide icon per metric.
5. THE Admin_Panel data tables SHALL use alternating row backgrounds (`var(--color-surface)` / `var(--color-surface-alt)`), a sticky header row, and `var(--color-border)` borders.
6. THE Admin_Panel forms SHALL use shadcn/ui `Input`, `Select`, and `Textarea` components styled to the Design_System tokens.
7. WHEN a form is submitted successfully, THE Admin_Panel SHALL display a success toast notification using a Lucide `CheckCircle` icon.
8. IF a form submission fails, THEN THE Admin_Panel SHALL display an error toast notification using a Lucide `AlertCircle` icon.
9. THE Admin_Panel login page SHALL be a centered card on a `var(--color-surface-alt)` background with no dark styling.

---

### Requirement 14: Global Animation Standards

**User Story:** As a visitor, I want smooth, consistent micro-interactions, so that the platform feels polished and responsive to my actions.

#### Acceptance Criteria

1. WHEN a ProductCard is hovered, THE ProductCard SHALL apply `transform: scale(1.01)` with a 200ms ease-out transition.
2. WHEN a button is clicked (mousedown), THE button SHALL apply `transform: scale(0.98)` with a 100ms ease-in transition.
3. WHEN a page is navigated to, THE page content SHALL fade in using a framer-motion `opacity: 0 to 1` animation over 300ms.
4. THE Platform SHALL use framer-motion `AnimatePresence` for all conditional mount/unmount animations (dropdowns, modals, toasts, CompareBar).
5. WHILE a data fetch is in progress, THE Platform SHALL render a LoadingSkeleton with a CSS shimmer animation using a linear gradient sweep — no spinner icons.
6. THE LoadingSkeleton SHALL match the shape and dimensions of the content it replaces (card skeleton for ProductCard, row skeleton for table rows).

---

### Requirement 15: EmptyState Component

**User Story:** As a visitor, I want informative empty states, so that I understand why content is missing and know what action to take next.

#### Acceptance Criteria

1. THE EmptyState SHALL accept a Lucide icon component, a heading string, a description string, and an optional action button as props.
2. THE EmptyState SHALL be centered within its container with a minimum vertical padding of 64px.
3. THE EmptyState icon SHALL be rendered at 48px size in `var(--color-muted)`.
4. THE EmptyState heading SHALL use `var(--color-primary)` and the description SHALL use `var(--color-muted)`.

---

### Requirement 16: Strict Visual Constraints

**User Story:** As a designer, I want enforceable visual rules, so that no contributor accidentally introduces dark backgrounds, emojis, or off-brand styling.

#### Acceptance Criteria

1. THE Platform SHALL NOT render any element with a dark background color (e.g., `bg-zinc-900`, `bg-black`, `bg-gray-900`, or any color with lightness below 90% in HSL) on any public-facing page.
2. THE Platform SHALL NOT render any emoji character in any visible UI element; all iconography SHALL use Lucide components.
3. THE Platform SHALL NOT use purple gradients, glassmorphism dark overlays, or neon accent colors.
4. THE Platform SHALL NOT use inline `style` attributes for colors or spacing that are already expressible as Design_System tokens.
5. THE Platform SHALL maintain a minimum touch target size of 44x44px for all interactive elements on mobile viewports.
6. THE Platform SHALL use a maximum content width of 1280px (`max-w-7xl`) centered with auto horizontal margins on all pages.
