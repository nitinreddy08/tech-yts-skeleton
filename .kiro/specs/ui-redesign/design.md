# Design Document: UI Redesign

## Overview

This document covers the complete visual/frontend redesign of the Next.js tech affiliate platform. The backend — Supabase, server actions, and all data-fetching functions — is untouched. Only the UI layer changes: pages, components, layout, typography, color, spacing, and animation.

The target aesthetic is luxury-minimal: clean white surfaces, generous whitespace, precise typography, and subtle motion. Reference points are Apple.com, Anthropic.com, Vercel, and Linear.

**Stack additions required:**
- `framer-motion` — page transitions and micro-interactions
- `@radix-ui/react-accordion` — FAQAccordion
- `embla-carousel-react` — Similar Products carousel
- `lucide-react` — sole icon library (replaces all emojis)
- `geist` font (already partially configured via `next/font/google`)

No backend changes. No new Supabase tables. No new server actions.

---

## Architecture

### Files That Change (UI layer only)

```
app/globals.css                          — design tokens, font vars, body defaults
app/layout.tsx                           — font setup, remove dark class, add Navbar/Footer
app/page.tsx                             — full homepage redesign
app/[category]/page.tsx                  — category page redesign
app/[category]/[product]/page.tsx        — product detail page redesign
app/compare/[...slugs]/page.tsx          — comparison page redesign
app/compare/page.tsx                     — comparison landing redesign
app/search/page.tsx                      — search results page redesign
app/best-of/[slug]/page.tsx              — best-of list page redesign
app/admin/layout.tsx                     — admin sidebar redesign (light theme)
app/admin/page.tsx                       — admin dashboard redesign
app/admin/login/page.tsx                 — login page redesign
```

### New Files to Create

```
app/deals/page.tsx                       — new dedicated Deals route
components/ui/Navbar.tsx                 — sticky top nav with search, mobile drawer
components/ui/Footer.tsx                 — site footer with nav and social links
components/ui/EmptyState.tsx             — reusable empty state component
components/ui/LoadingSkeleton.tsx        — shimmer skeleton variants
components/ui/CompareBar.tsx             — fixed bottom compare bar
components/ui/CategoryPills.tsx          — horizontal scrollable category filter
components/ui/AffiliateButton.tsx        — CTA button routing through /go/[id]
```

### Files That Do NOT Change

```
lib/**                                   — all data fetching, utils, supabase clients
types/index.ts                           — all TypeScript types
app/api/**                               — all API routes
app/go/[id]/route.ts                     — affiliate redirect
app/sitemap.ts
supabase/**
components/admin/**                      — admin forms (styling updated in-place via tokens)
components/providers/**
```

---

## Design System Setup

### globals.css

Replace the entire file with:

```css
@import "tailwindcss";

:root {
  /* Color tokens */
  --color-primary:       #111111;
  --color-accent:        #0066FF;
  --color-surface:       #FFFFFF;
  --color-surface-alt:   #F9F9F7;
  --color-surface-admin: #F5F4F0;
  --color-border:        #E5E5E5;
  --color-muted:         #6B7280;

  /* Shadow scale */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.04);

  /* Border radius tokens */
  --radius-card:    12px;
  --radius-card-lg: 16px;
}

@theme inline {
  --color-primary:       var(--color-primary);
  --color-accent:        var(--color-accent);
  --color-surface:       var(--color-surface);
  --color-surface-alt:   var(--color-surface-alt);
  --color-surface-admin: var(--color-surface-admin);
  --color-border:        var(--color-border);
  --color-muted:         var(--color-muted);
  --font-heading:        var(--font-geist-sans);
  --font-body:           var(--font-inter);
  --shadow-sm:           var(--shadow-sm);
  --shadow-md:           var(--shadow-md);
}

body {
  background-color: var(--color-surface);
  color: var(--color-primary);
  font-family: var(--font-body), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar hiding utility */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Shimmer animation for LoadingSkeleton */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.shimmer {
  background: linear-gradient(90deg, var(--color-surface-alt) 25%, #ebebeb 50%, var(--color-surface-alt) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
```

### app/layout.tsx Changes

- Import both `Geist` (heading) and `Inter` (body) from `next/font/google`
- Assign CSS variables `--font-geist-sans` and `--font-inter`
- Remove `dark` class from `<html>`
- Remove dynamic `--color-primary` / `--color-secondary` inline styles (tokens are now static in globals.css; white-label dynamic colors are a separate concern handled via SiteConfigProvider if needed)
- Add `<Navbar />` and `<Footer />` wrapping `{children}` inside `<body>`

```tsx
// app/layout.tsx (structure only — not final code)
import { Geist, Inter } from 'next/font/google'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

// html className: `${geist.variable} ${inter.variable} h-full antialiased`
// body: min-h-full flex flex-col bg-surface text-primary
// body children: <Navbar /> {children} <Footer />
```

---

## Components and Interfaces

### Navbar (`components/ui/Navbar.tsx`)

**Props:** none (reads `SiteConfig` via context or server fetch)

**Structure:**
```
<header> — sticky top-0 z-50, bg-surface/85 backdrop-blur-md, border-b border-border (conditional on scroll)
  <div> — max-w-7xl mx-auto px-4 h-16 flex items-center gap-4
    [Left]  Logo / site name — font-heading font-semibold text-primary
    [Center] <SearchBar /> — flex-1 max-w-md hidden md:block
    [Right]  nav links + compare icon + mobile menu button
  </div>
  <MobileDrawer /> — slide-in from left, Sheet-style, shown when Menu icon clicked
```

**Scroll border logic (client component):**
```tsx
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 0)
  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}, [])
// Apply: border-b border-border when scrolled, border-b border-transparent when not
```

**Tailwind classes (key):**
- Header: `sticky top-0 z-50 bg-white/85 backdrop-blur-md transition-shadow`
- Inner: `mx-auto flex h-16 max-w-7xl items-center gap-4 px-4`
- Logo: `font-heading text-lg font-semibold text-primary`
- Nav links: `hidden md:flex items-center gap-6 text-sm text-muted hover:text-primary transition-colors`
- Mobile menu button: `md:hidden` with Lucide `Menu` icon, 44×44px touch target

**Icons used:** `Search`, `GitCompare`, `Menu`, `X` (drawer close) — all from `lucide-react`

---

### Footer (`components/ui/Footer.tsx`)

**Structure:**
```
<footer> — bg-surface-alt border-t border-border
  <div> — max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8
    [Col 1] Site name + tagline
    [Col 2] Navigation links (Home, Deals, Compare, Best Of)
    [Col 3] Social links using Lucide icons (Youtube, Twitter/X, Instagram)
  </div>
  <div> — border-t border-border py-4 text-center text-xs text-muted
    footer_text from SiteConfig
  </div>
```

---

### EmptyState (`components/ui/EmptyState.tsx`)

**Props:**
```tsx
interface EmptyStateProps {
  icon: LucideIcon        // Lucide icon component
  heading: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}
```

**Structure:**
```
<div> — flex flex-col items-center justify-center py-16 text-center
  <Icon> — size={48} className="text-muted mb-4"
  <h3>  — text-lg font-semibold text-primary mb-2
  <p>   — text-sm text-muted max-w-sm
  [optional] <button> or <Link> — mt-6 accent CTA
```

---

### LoadingSkeleton (`components/ui/LoadingSkeleton.tsx`)

Exports two variants:

**`ProductCardSkeleton`** — matches ProductCard dimensions:
```
<div> — rounded-[var(--radius-card)] border border-border overflow-hidden
  <div> — aspect-square shimmer (image area)
  <div> — p-6 flex flex-col gap-3
    <div> — h-3 w-16 shimmer rounded (brand)
    <div> — h-4 w-full shimmer rounded (name line 1)
    <div> — h-4 w-3/4 shimmer rounded (name line 2)
    <div> — h-5 w-24 shimmer rounded (price)
```

**`TableRowSkeleton`** — matches admin table row:
```
<div> — flex gap-4 px-4 py-3 border-b border-border
  <div> — h-4 w-1/4 shimmer rounded
  <div> — h-4 w-1/3 shimmer rounded
  <div> — h-4 w-1/5 shimmer rounded
```

---

### CategoryPills (`components/ui/CategoryPills.tsx`)

**Props:**
```tsx
interface CategoryPillsProps {
  categories: Category[]
  activeSlug?: string
}
```

**Structure:**
```
<div> — flex gap-2 overflow-x-auto no-scrollbar py-1
  {categories.map(cat =>
    <Link> — flex items-center gap-2 px-4 h-9 rounded-full border text-sm font-medium
             whitespace-nowrap transition-colors
             default: border-border bg-surface text-primary hover:border-accent/40
             active:  border-accent bg-accent/5 text-accent
      <LucideIcon> — size={16} (mapped from cat.icon string)
      {cat.name}
  )}
```

**Icon mapping** — a `CATEGORY_ICON_MAP: Record<string, LucideIcon>` maps category slug/icon strings to Lucide components (e.g. `smartphone → Smartphone`, `laptop → Laptop`, `headphones → Headphones`, fallback `Tag`).

---

### AffiliateButton (`components/ui/AffiliateButton.tsx`)

**Props:**
```tsx
interface AffiliateButtonProps {
  link: AffiliateLink
  isBestPrice?: boolean
  size?: 'sm' | 'md' | 'lg'
}
```

**Structure:**
```
<Link href={`/go/${link.id}`} target="_blank" rel="noopener noreferrer">
  <ShoppingCart size={16} />
  <span>{link.store_name}</span>
  {link.price_inr && <span>{formatIndianPrice(link.price_inr)}</span>}
```

**Variants:**
- `isBestPrice=true`: `bg-accent text-white hover:bg-accent/90`
- default: `bg-surface border border-border text-primary hover:bg-surface-alt`
- Active press: `active:scale-[0.98] transition-transform duration-100`

---

### CompareBar (`components/ui/CompareBar.tsx`)

**Props:**
```tsx
interface CompareBarProps {
  products: ProductSummary[]
  onRemove: (id: string) => void
  onClear: () => void
}
```

**Structure:**
```
<AnimatePresence>
  {products.length >= 2 && (
    <motion.div> — fixed bottom-0 left-0 right-0 z-50
                   bg-surface border-t border-border shadow-md
                   px-4 py-3 flex items-center gap-4
      {products.map(p =>
        <motion.div key={p.id} layout exit={{ opacity:0, scale:0.8 }}>
          thumbnail + X remove button
        </motion.div>
      )}
      <Link href="/compare/..."> — "Compare Now" accent CTA button
      <button onClick={onClear}> — "Clear" text-muted
    </motion.div>
  )}
</AnimatePresence>
```

---

### ProductCard (`components/ui/ProductCard.tsx`) — Redesigned

**Key changes from current:**
- Background: `bg-surface` (white) instead of `bg-white/5`
- Border: `border border-border` instead of `border-white/10`
- Shadow: `shadow-[var(--shadow-sm)]`
- Border radius: `rounded-[var(--radius-card)]`
- Image area background: `bg-surface-alt`
- Brand: `text-xs text-muted`
- Name: `text-sm font-semibold text-primary line-clamp-2`
- Price: `text-base font-bold text-accent`
- Hover: `hover:scale-[1.01] transition-transform duration-200 ease-out`
- No thumbnail fallback: `<Package size={40} className="text-muted/30" />` (Lucide)
- DealBadge: `bg-accent text-white` — no emoji text
- Info section padding: `p-6`
- Compare button: `<GitCompare size={14} />` + "Compare" text
- Rating badge: `bg-primary text-white` rounded

**Full Tailwind structure:**
```
<div> — group relative flex flex-col rounded-[var(--radius-card)] border border-border
         bg-surface shadow-[var(--shadow-sm)] hover:scale-[1.01]
         transition-transform duration-200 ease-out overflow-hidden

  [DealBadge] — absolute top-2 right-2 z-10 bg-accent text-white text-xs px-2 py-0.5 rounded-full

  [Rank badge] — absolute top-2 left-2 z-10 bg-primary text-white ...

  <Link> — block aspect-square relative overflow-hidden bg-surface-alt
    <Image /> or <Package /> placeholder

  <div> — flex flex-col gap-2 p-6
    <p>  brand — text-xs text-muted
    <h3> name  — text-sm font-semibold text-primary line-clamp-2
    <p>  price — text-base font-bold text-accent
    <div> — flex items-center gap-2 mt-auto pt-2
      [Compare btn] — flex items-center gap-1 text-xs text-muted hover:text-primary
      [View Details] — ml-auto text-xs font-medium text-accent hover:underline
```

---

### BuySection (`components/ui/BuySection.tsx`) — Redesigned

- Container: `rounded-[var(--radius-card-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]`
- Each row: replaced with `<AffiliateButton>` component
- Remove emoji store icons entirely — use `<ShoppingCart>` Lucide icon
- Sticky wrapper on product detail page: `sticky top-20`

---

### SearchBar (`components/ui/SearchBar.tsx`) — Redesigned

**Key changes:**
- Input: `rounded-full border border-border bg-surface px-4 py-2 pl-10 text-sm text-primary placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none`
- Left icon: `<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />`
- Clear button: `<X size={14} />` shown when `query.length > 0`
- Dropdown: `bg-surface border border-border rounded-[var(--radius-card)] shadow-[var(--shadow-md)]`
- Suggestion item: product name (primary), category slug (muted), thumbnail
- Empty state inside dropdown: `<EmptyState icon={SearchX} heading="No results" description="..." />`
- Limit results to 8 (update fetch `limit=8`)

---

## Data Models

No new data models are introduced. The redesign consumes existing types from `types/index.ts` unchanged:

- `ProductSummary` — used by ProductCard, CategoryPills, CompareBar
- `ProductDetail` — used by product detail page, BuySection, SpecsTable
- `Deal` — used by Deals page, DealBadge
- `Category` — used by CategoryPills, category page header
- `BestOfList` / `BestOfListItem` — used by best-of page
- `AffiliateLink` — used by AffiliateButton, BuySection
- `SiteConfig` — used by Navbar, Footer, layout
- `SearchResult` — used by SearchBar dropdown

**New derived types (UI-only, no DB impact):**

```tsx
// For CompareBar state (client-side only)
interface CompareSelection {
  products: ProductSummary[]   // max 4
}

// For animation variants (framer-motion)
interface FadeInVariants {
  hidden: { opacity: 0; y: number }
  visible: { opacity: 1; y: 0; transition: { duration: number } }
}
```

**Shared animation variants** (define once in `lib/utils/motion.ts`):

```tsx
export const fadeInUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
}
```

---

## Page-by-Page Layout Specs

### Homepage (`app/page.tsx`)

```
<main> — flex flex-col (no gap — each section handles its own padding)

  [Hero] — bg-surface-alt py-20 px-4 text-center
    max-w-3xl mx-auto
    creator photo (if present) — 80px circle, border-2 border-border
    <h1> — font-heading text-4xl md:text-5xl font-bold text-primary
    <p>  — mt-3 text-lg text-muted (tagline)
    <SearchBar /> — mt-8 max-w-lg mx-auto
    CTA links — mt-6 flex gap-3 justify-center

  [CategoryPills] — py-6 px-4 border-b border-border
    max-w-7xl mx-auto

  [Deal of the Day] — py-20 px-4 (conditional)
    max-w-7xl mx-auto
    banner: rounded-[var(--radius-card-lg)] bg-accent/4 border border-accent/10 p-6
    <Zap size={20} className="text-accent" /> — no fire emoji

  [Featured Products] — py-20 px-4
    max-w-7xl mx-auto
    grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4

  [Best Of Preview] — py-20 px-4 bg-surface-alt
    max-w-7xl mx-auto
    grid gap-4 sm:grid-cols-2 lg:grid-cols-3

  [Latest Reviews] — py-20 px-4
    max-w-7xl mx-auto
    grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4

  [Empty state] — py-20 px-4 (when no products)
    <EmptyState icon={Package} heading="No products yet" description="Check back soon" />
```

All sections wrapped in `<motion.section whileInView="visible" initial="hidden" variants={fadeInUp} viewport={{ once: true }}>`.

---

### Category Page (`app/[category]/page.tsx`)

```
<main> — max-w-7xl mx-auto px-4 py-8

  [Page header] — bg-surface-alt rounded-[var(--radius-card-lg)] p-6 mb-8
    flex items-center gap-4
    <LucideIcon> — 40px (mapped from cat.icon)
    <h1> — font-heading text-2xl font-bold text-primary
    <p>  — text-sm text-muted (description)
    <p>  — text-xs text-muted ({count} products)

  <div> — flex flex-col lg:flex-row gap-6

    [Filter sidebar] — w-full lg:w-56 shrink-0
      desktop: always visible
      mobile: collapsible drawer triggered by "Filters" button with <SlidersHorizontal> icon
      container: rounded-[var(--radius-card)] border border-border bg-surface p-4

      Sort: <select> styled with border-border, rounded-lg
      Brand: checkbox list, accent checkboxes
      Price range: dual-handle slider (use native range inputs or @radix-ui/react-slider)
      Min rating: radio group

      [Apply] button: bg-accent text-white rounded-lg py-2 w-full

    [Product grid] — flex-1
      IF empty: <EmptyState icon={SearchX} heading="No products match" action="Clear Filters" />
      ELSE: grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4
        {products.map(p => <ProductCard key={p.id} product={p} />)}
```

---

### Product Detail Page (`app/[category]/[product]/page.tsx`)

```
<main> — max-w-7xl mx-auto px-4 py-8

  [Breadcrumb] — flex items-center gap-1.5 text-sm text-muted mb-6
    Home <ChevronRight size={14} /> {category} <ChevronRight size={14} /> {name}

  <div> — grid gap-8 lg:grid-cols-[1fr_360px]

    [Left column]
      <ProductGallery /> — existing component, restyled
      [Pros/Cons] — grid sm:grid-cols-2 gap-4 mt-8
        Pros: border border-green-200 bg-green-50 rounded-[var(--radius-card)] p-4
          <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
        Cons: border border-red-200 bg-red-50 rounded-[var(--radius-card)] p-4
          <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
      [Creator's Take] — mt-8
        YouTube embed: aspect-video rounded-[var(--radius-card-lg)] overflow-hidden
        Description: text-muted leading-relaxed
      [Full Specs] — mt-8
        <SpecsTable /> — alternating bg-surface / bg-surface-alt rows
      [FAQ] — mt-8
        <FAQAccordion /> — Radix UI Accordion, smooth height animation
      [Similar Products] — mt-8
        <EmblaCarousel> — embla-carousel-react horizontal scroll

    [Right column — sticky]
      <div> — sticky top-20 flex flex-col gap-4
        [Product header]
          <p> brand — text-sm text-muted
          <h1> name — font-heading text-2xl font-bold text-primary
          <p> tagline — text-muted
        [Rating badge]
          <div> — inline-flex items-center gap-2
            score box: bg-primary text-white rounded-xl px-3 py-2 font-bold
            "Creator Rating / 10" label
        <BuySection /> — redesigned, sticky container
        [Compare CTA]
          <Link> — border border-border rounded-[var(--radius-card)] px-4 py-3
                   flex items-center gap-2 text-sm text-muted hover:text-primary
            <GitCompare size={16} /> Compare with another product
```

---

### Deals Page (`app/deals/page.tsx`) — New Route

```
<main> — max-w-7xl mx-auto px-4 py-8

  [Page heading]
    <h1> — font-heading text-3xl font-bold text-primary
    <p>  — text-muted

  [Deal of the Day hero] — conditional
    rounded-[var(--radius-card-lg)] bg-surface-alt border border-border p-6 md:p-8 mb-12
    flex flex-col md:flex-row gap-6 items-center
    <Zap size={20} className="text-accent" /> "Deal of the Day" label
    product image (160px, bg-surface rounded-xl)
    headline, product name
    deal price: text-3xl font-bold text-accent
    original price: line-through text-muted
    discount %: text-sm font-semibold text-accent
    <AffiliateButton isBestPrice />
    countdown timer (if expires_at): <Clock size={14} /> + formatted time

  [Price Drops grid]
    <h2> — font-heading text-xl font-semibold text-primary mb-4
    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4
    Each deal card:
      rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)]
      product thumbnail + name
      <TrendingDown size={14} className="text-accent" /> discount %
      deal price in accent, original price struck through
      <AffiliateButton />

  [Empty state] — conditional
    <EmptyState icon={Tag} heading="No active deals" description="Check back soon for deals" />
```

---

### Comparison Page (`app/compare/[...slugs]/page.tsx`)

```
<main> — max-w-7xl mx-auto px-4 py-8

  <h1> — font-heading text-2xl font-bold text-primary mb-8
    "{product1} vs {product2} [vs ...]"

  [Product header row]
    grid with first col 200px, remaining cols 1fr each
    Each product col: rounded-[var(--radius-card)] border border-border bg-surface p-4
      brand (muted), name (primary), rating badge, <BuySection />

  [CompareTable]
    overflow-x-auto rounded-[var(--radius-card)] border border-border
    <table> w-full text-sm
      <tbody>
        alternating bg-surface / bg-surface-alt rows
        First td: sticky left-0 bg-inherit w-48 font-medium text-muted px-4 py-3
        Winning value td: text-accent font-semibold + <Trophy size={12} />

  [Verdict section]
    mt-12 rounded-[var(--radius-card-lg)] bg-surface-alt border border-border p-6
    editorial summary text
    recommended ProductCard

  <CompareBar /> — fixed bottom bar (client component, reads compare state)
```

---

### Search Page (`app/search/page.tsx`)

```
<main> — max-w-7xl mx-auto px-4 py-8

  <h1> — font-heading text-2xl font-bold text-primary
    Results for "<mark className="bg-accent/10 text-accent px-1 rounded">{query}</mark>"
  <p>  — text-sm text-muted mb-8  "{count} products found"

  IF results empty:
    <EmptyState icon={SearchX} heading="No results for '{query}'"
      description="Try a different search term or browse categories"
      action={{ label: "Browse Categories", href: "/" }} />
  ELSE:
    grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4
    Each ProductCard with query term highlighted in name via <mark>
```

---

### Best-Of List Page (`app/best-of/[slug]/page.tsx`)

```
<main> — max-w-7xl mx-auto px-4 py-10

  [Editorial header] — full-width, mb-10
    cover image: w-full h-48 sm:h-64 object-cover rounded-[var(--radius-card-lg)]
    <h1> — font-heading text-3xl font-bold text-primary mt-6
    <p>  — text-muted leading-relaxed mt-3

  <div> — flex gap-8

    [ToC sidebar] — hidden lg:block w-48 shrink-0
      sticky top-20
      <nav> — flex flex-col gap-1
        Each item: text-sm text-muted hover:text-primary
        Active item: text-accent font-medium
      (IntersectionObserver updates active item on scroll)

    [Items list] — flex-1 flex flex-col gap-6
      Each item:
        <article id={`item-${item.rank}`}> — flex gap-4 rounded-[var(--radius-card-lg)]
                                              border border-border bg-surface p-5
                                              shadow-[var(--shadow-sm)]
          rank number: text-3xl font-bold text-accent font-heading w-10 shrink-0
          thumbnail: 80px rounded-xl bg-surface-alt
          info: brand (muted), name (primary font-semibold), pick_reason (muted text-sm)
          price + <AffiliateButton />
```

---

### Admin Layout (`app/admin/layout.tsx`) — Light Theme

```
<div> — flex min-h-screen bg-surface-admin

  <aside> — hidden lg:flex flex-col w-56 shrink-0
             border-r border-border bg-surface
    [Header] — px-4 py-5 border-b border-border
      <p> — text-xs font-semibold uppercase tracking-wider text-muted
      "Admin Panel"
    <nav> — flex flex-col gap-1 p-3
      Each <Link>: flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted
                   hover:bg-surface-alt hover:text-primary transition-colors
        <LucideIcon size={16} />
        {label}
    [Footer] — mt-auto border-t border-border p-3
      Sign out button with <LogOut size={16} />

  <main> — flex-1 overflow-auto
    {children}
```

**Nav items with Lucide icons:**
```tsx
const NAV_ITEMS = [
  { href: '/admin',            label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Products',     icon: Package },
  { href: '/admin/deals',      label: 'Deals',        icon: Zap },
  { href: '/admin/best-of-lists', label: 'Best Of Lists', icon: Trophy },
  { href: '/admin/site-config', label: 'Site Config', icon: Settings },
]
```

---

### Admin Dashboard (`app/admin/page.tsx`) — Light Theme

```
<div> — p-8

  <h1> — font-heading text-2xl font-bold text-primary mb-8

  [Stat cards] — grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8
    Each card: rounded-[var(--radius-card)] border border-border bg-surface
               shadow-[var(--shadow-sm)] p-5
      <LucideIcon size={20} className="text-muted mb-3" />
      <p> label — text-sm text-muted
      <p> value — text-3xl font-bold text-primary mt-1

  [Quick Actions] — grid gap-3 sm:grid-cols-2 lg:grid-cols-4
    Each: rounded-[var(--radius-card)] border border-border bg-surface p-4
          flex items-center gap-2.5 text-sm font-medium text-primary
          hover:bg-surface-alt transition-colors
      <LucideIcon size={16} className="text-accent" />
```

---

## Animation Patterns

All animations use `framer-motion`. Define shared variants in `lib/utils/motion.ts`.

### Page Entrance
```tsx
// Wrap page <main> content
<motion.div initial="hidden" animate="visible" variants={fadeIn}>
```

### Section Scroll Entrance
```tsx
<motion.section
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-80px" }}
  variants={fadeInUp}
>
```

### Staggered Grid
```tsx
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={fadeInUp}>
      <ProductCard product={item} />
    </motion.div>
  ))}
</motion.div>
```

### Button Press
```tsx
// Apply to all interactive buttons
<motion.button whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
```

### CompareBar Mount/Unmount
```tsx
<AnimatePresence>
  {visible && (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
```

### Dropdown (SearchBar, mobile nav)
```tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.15 }}
    >
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: No emoji characters in rendered UI

*For any* rendered component in the platform, the resulting HTML output should contain no emoji characters (Unicode ranges U+1F300–U+1FAFF, U+2600–U+26FF, U+2700–U+27BF) in any visible text node or attribute.

**Validates: Requirements 1.7, 2.5, 13.3, 16.2**

---

### Property 2: No dark background classes on public pages

*For any* public-facing page component (outside `/admin`), no element in the rendered output should carry a Tailwind class that maps to a background color with HSL lightness below 90% (e.g. `bg-zinc-900`, `bg-black`, `bg-gray-900`, `bg-white/5` dark overlays).

**Validates: Requirements 1.8, 16.1**

---

### Property 3: ProductCard content structure

*For any* `ProductSummary` passed to `ProductCard`, the rendered output should contain: (a) the brand name in an element with `text-muted` styling above the product name, (b) the product name in an element with `line-clamp-2` and `text-primary` styling, (c) the price (when non-null) in an element with `text-accent` styling, and (d) a `<Package>` Lucide icon placeholder when `thumbnail_url` is null.

**Validates: Requirements 5.2, 5.3, 5.4, 5.9**

---

### Property 4: DealBadge renders for all flagged products

*For any* `ProductSummary` where `is_deal_of_the_day` is `true` or `deal_badge_text` is non-null, the `ProductCard` should render a badge element with `bg-accent` styling and no emoji characters in its text content.

**Validates: Requirements 5.7**

---

### Property 5: BuySection sort and highlight invariant

*For any* array of `AffiliateLink` objects passed to `BuySection`, the rendered affiliate buttons should appear in ascending order of `price_inr` (nulls last), and the button corresponding to the lowest price should carry the `bg-accent` highlight class.

**Validates: Requirements 7.3**

---

### Property 6: AffiliateButton content completeness

*For any* `AffiliateLink` passed to `AffiliateButton`, the rendered output should contain a Lucide `ShoppingCart` icon, the `store_name` text, and the formatted `price_inr` (when non-null) — and no emoji characters.

**Validates: Requirements 7.4**

---

### Property 7: Alternating row backgrounds in tables

*For any* table rendered by `SpecsTable` or an admin data table, rows at even indices should have `bg-surface` and rows at odd indices should have `bg-surface-alt` (or vice versa consistently), with no row sharing the same background as its immediate neighbor.

**Validates: Requirements 7.5, 13.5**

---

### Property 8: Pros use CheckCircle, cons use XCircle

*For any* product with non-empty `pros` array, each pro item should render a Lucide `CheckCircle` icon with a green color class. *For any* product with non-empty `cons` array, each con item should render a Lucide `XCircle` icon with a red color class. No text symbols (`✓`, `✗`) or emojis should appear.

**Validates: Requirements 7.10**

---

### Property 9: SearchBar suggestion count limit

*For any* search query of 2 or more characters, the suggestions dropdown should display at most 8 items regardless of how many results the API returns.

**Validates: Requirements 3.2**

---

### Property 10: SearchBar suggestion item completeness

*For any* `SearchResult` rendered in the SearchBar dropdown, the suggestion item should display the product name, the category slug, and a thumbnail image (when `thumbnail_url` is non-null).

**Validates: Requirements 3.3**

---

### Property 11: Navbar scroll border toggle

*For any* scroll position greater than 0px, the Navbar element should have the `border-border` border-bottom class applied. At scroll position 0, the border should not be visible (transparent or absent).

**Validates: Requirements 2.3**

---

### Property 12: CompareBar visibility threshold

*For any* compare selection state, the `CompareBar` should be visible (mounted in the DOM) if and only if 2 or more products are selected, and hidden (unmounted via `AnimatePresence`) when fewer than 2 are selected.

**Validates: Requirements 9.6**

---

### Property 13: Comparison page enforces max 4 products

*For any* attempt to add a product to the comparison selection when 4 products are already selected, the selection should remain at 4 and the new product should not be added.

**Validates: Requirements 9.1**

---

### Property 14: CompareTable winning value highlight

*For any* spec row in the `CompareTable` where at least two product values differ, the cell containing the winning value should have `text-accent` styling and a Lucide `Trophy` icon. Rows where all values are identical should have no highlight.

**Validates: Requirements 9.4**

---

### Property 15: Search results query term highlighting

*For any* search result product name that contains the search query string (case-insensitive), the rendered product name should wrap the matching substring in a `<mark>` element with `bg-accent/10 text-accent` styling.

**Validates: Requirements 10.5**

---

### Property 16: Best-Of rank numbers in accent color

*For any* `BestOfListItem`, the rendered rank number element should use `text-accent` styling and contain only a numeric character — no emoji, no trophy symbol.

**Validates: Requirements 11.2, 11.3**

---

### Property 17: Deals page shows all active price_drop deals

*For any* array of active `Deal` objects, all deals with `deal_type === 'price_drop'` should appear in the Price Drops grid. No active price_drop deal should be omitted.

**Validates: Requirements 12.3**

---

### Property 18: Deal card discount display

*For any* deal card where both `deal_price_inr` and `original_price_inr` are non-null, the rendered card should display the computed discount percentage alongside a Lucide `TrendingDown` icon with `text-accent` styling.

**Validates: Requirements 12.4**

---

### Property 19: EmptyState renders all props with correct token styling

*For any* set of props passed to `EmptyState` (icon, heading, description, optional action), the rendered output should: display the icon at 48px with `text-muted` color, the heading with `text-primary`, the description with `text-muted`, and the action button (when provided) as a visible interactive element.

**Validates: Requirements 15.1, 15.2, 15.3, 15.4**

---

### Property 20: All pages use max-w-7xl content width

*For any* public page, the primary content container should have the `max-w-7xl` class (1280px max-width) with `mx-auto` centering. No page should allow content to stretch beyond 1280px on wide viewports.

**Validates: Requirements 16.6**

---

### Property 21: CategoryPills render icon and name for every category

*For any* array of `Category` objects passed to `CategoryPills`, every rendered pill should contain a Lucide icon component (not an emoji) and the category `name` text.

**Validates: Requirements 4.2**

---

### Property 22: Homepage Best-Of preview cap

*For any* array of `BestOfList` objects, the homepage Best-Of preview section should render at most 3 list cards regardless of how many lists exist.

**Validates: Requirements 6.6**

---

### Property 23: Deal of the Day banner conditional render

*For any* homepage render where at least one deal with `deal_type === 'deal_of_day'` exists in the active deals array, the Deal of the Day banner should be present in the output. When no such deal exists, the banner should be absent.

**Validates: Requirements 6.4**

---

## Error Handling

### Data Fetch Failures
- All server components use `try/catch` around data fetches; on failure they render `<EmptyState>` with an appropriate message rather than crashing
- `notFound()` is called when a product/category/list slug resolves to null — this renders Next.js's 404 page

### Empty States
Every list/grid has a defined empty state using the `EmptyState` component:

| Context | Icon | Heading |
|---|---|---|
| Category page, no products after filter | `SearchX` | "No products match your filters" |
| Search page, no results | `SearchX` | "No results for '{query}'" |
| Deals page, no active deals | `Tag` | "No active deals right now" |
| SearchBar dropdown, no results | `SearchX` | "No results" |
| Compare page, < 2 products | `GitCompare` | "Add products to compare" |

### Form Errors (Admin)
- Server action errors surface via `useActionState` / returned error objects
- Toast notifications use `AnimatePresence` for mount/unmount
- Success toast: `<CheckCircle size={16} className="text-green-600" />`
- Error toast: `<AlertCircle size={16} className="text-red-500" />`

### Image Load Failures
- All `<Image>` components have an `onError` handler that swaps to the `<Package>` Lucide placeholder
- No broken image icons or alt-text-only fallbacks

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests catch concrete bugs in specific scenarios and verify integration points
- Property tests verify universal correctness across all generated inputs

### Property-Based Testing

**Library:** `fast-check` (already in `devDependencies`)

**Configuration:** Each property test runs a minimum of 100 iterations.

**Tag format:** Each test file includes a comment:
`// Feature: ui-redesign, Property {N}: {property_text}`

Each of the 23 correctness properties above maps to exactly one `fc.assert(fc.property(...))` test.

**Example structure:**
```ts
// Feature: ui-redesign, Property 3: ProductCard content structure
it('renders brand, name, price, and placeholder for any ProductSummary', () => {
  fc.assert(
    fc.property(arbitraryProductSummary(), (product) => {
      const { container } = render(<ProductCard product={product} />)
      // brand above name
      expect(container.querySelector('.text-muted')).toBeTruthy()
      // name is line-clamped
      expect(container.querySelector('.line-clamp-2')).toBeTruthy()
      // price in accent when non-null
      if (product.current_price_inr !== null) {
        expect(container.querySelector('.text-accent')).toBeTruthy()
      }
      // Package icon when no thumbnail
      if (!product.thumbnail_url) {
        expect(container.querySelector('[data-lucide="package"]')).toBeTruthy()
      }
    }),
    { numRuns: 100 }
  )
})
```

**Arbitraries to define** (in `__tests__/arbitraries.ts`):
- `arbitraryProductSummary()` — generates valid `ProductSummary` with randomized fields
- `arbitraryAffiliateLink()` — generates valid `AffiliateLink`
- `arbitraryDeal()` — generates valid `Deal`
- `arbitraryCategory()` — generates valid `Category`
- `arbitraryBestOfListItem()` — generates valid `BestOfListItem`

### Unit Tests

Focus on:
- Specific rendering examples (e.g. "renders EmptyState when deals array is empty")
- Integration between components (e.g. "CompareBar appears after adding 2 products")
- Edge cases (e.g. "SearchBar shows X button only when input is non-empty")
- Scroll handler logic for Navbar border toggle
- IntersectionObserver callback for Best-Of ToC active state

**Test files to create/update:**
```
components/ui/__tests__/ProductCard.test.tsx       — update for new design tokens
components/ui/__tests__/EmptyState.test.tsx        — new
components/ui/__tests__/SearchBar.test.tsx         — update
components/ui/__tests__/CompareBar.test.tsx        — new
components/ui/__tests__/AffiliateButton.test.tsx   — new
components/ui/__tests__/CategoryPills.test.tsx     — new
components/ui/__tests__/BuySection.test.tsx        — update
app/__tests__/deals.test.tsx                       — new (Deals page)
app/__tests__/homepage.test.tsx                    — new (Homepage sections)
```

### Visual Regression (Recommended, not required)
- Storybook + Chromatic for component-level visual snapshots
- Not blocking for initial implementation but recommended before production launch
