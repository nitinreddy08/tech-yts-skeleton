# Components — Verdict Design System 1.0

Specs for the core component set, in the same format as a mature design
system package: variant axes, dimensions, a full state color matrix, and a
discriminated-props implementation pattern. Two of these (**Product Card**
and **Score Ring**) don't exist in Autopay's set at all — they're original
to this domain and get the same level of detail as the borrowed ones.

---

## Button

**3 variant axes:**

| Axis | Values |
|------|--------|
| `variant` | `primary` · `secondary` · `deal` · `ghost` |
| `state` | `default` · `hover` · `active` · `disabled` (focus is CSS-driven) |
| `size` | `md` · `sm` |

### Dimensions

| Size | Height | Padding (y/x) | Font |
|------|--------|-----------------|------|
| Medium | 48px | 16 / 24 | 16px / Medium (500) |
| Small | 38px | 12 / 24 | 14px / Medium (500) |

Border radius: **8px** (`radius-md`) for both sizes. Width hugs content —
never fixed-width in production.

### Color matrix

#### `primary` — the default action button (Buy Now, Add to Compare)

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default | `primary-700` `#4B24A8` | white | none |
| Hover | `primary-800` `#3E2183` | white | none |
| Active | `primary-900` `#301C5F` | white | none |
| Disabled | `primary-700` @ 40% opacity | white @ 60% | none |

#### `secondary` — the default neutral button (Quick View, Filters)

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default | `neutral-0` white | `text-primary` | `neutral-500` `#C4C0CE` |
| Hover | `neutral-200` `#F1F0F5` | `text-primary` | `neutral-500` |
| Active | `neutral-300` `#E7E4EC` | `text-primary` | `neutral-500` |
| Disabled | `neutral-100` | `neutral-600` | `neutral-300` |

#### `deal` — the hero "wow" CTA (Deal of the Day, homepage hero)

Amber is reserved for this button and deal badges — nowhere else.

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default | `secondary-500` `#F7A222` | `neutral-1000` | none |
| Hover | `secondary-600` `#DD8A0E` | `neutral-1000` | none |
| Active | `secondary-700` `#B3710F` | white | none |
| Disabled | `neutral-300` | `neutral-600` | none |

#### `ghost` — transparent button on dark/image backgrounds (hero over gallery imagery)

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default | transparent | white | white 1px |
| Hover | white | `text-primary` | `neutral-100` |
| Active | transparent | white | white 1px |
| Disabled | transparent | `primary-700` @ 50% | `primary-700` @ 50% 1px |

### Implementation pattern

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'deal' | 'ghost'
  size?: 'md' | 'sm'
  disabled?: boolean
  children: React.ReactNode
  // ...standard button props
}
```

---

## Badge / Tag

Small pill labels — rating badges, discount badges, deal countdown badges,
stock badges, tag chips. Consolidates what Autopay splits across "Eyebrow"
(category label) and several ad-hoc badge patterns into one component
family, since this app uses badges far more than marketing eyebrows.

### Variant axes

| Axis | Values |
|------|--------|
| `variant` | `neutral` · `discount` · `deal` · `success` · `warning` · `error` · `category` |
| `size` | `sm` · `md` |

### Dimensions

| Size | Height | Padding (y/x) | Font | Radius |
|------|--------|-----------------|------|--------|
| md | 24px | 4 / 10 | 12px / Medium | full |
| sm | 20px | 2 / 8 | 10px / Medium | full |

### Colors per variant

| Variant | Background | Text | Use |
|---------|------------|------|-----|
| `neutral` | `neutral-100` `#F9F9FB` | `text-muted` | Generic tag |
| `discount` | `error-100` `#FBD0D1` | `error-700` `#B0272B` | "-20%" price badges |
| `deal` | `secondary-500` `#F7A222` | `neutral-1000` | "Deal of the Day" |
| `success` | `success-100` `#D4F7E7` | `success-700` `#2B825A` | "In stock," savings |
| `warning` | `warning-100` `#FDEFC3` | `warning-700` `#AA8518` | "Price may be outdated" |
| `error` | `error-100` `#FBD0D1` | `error-700` `#B0272B` | "Out of stock" |
| `category` | category `-100` tint (see `colors.md`) | category `-500` | Category chip on tiles |

### Implementation pattern

```tsx
type BadgeProps = {
  variant?: 'neutral' | 'discount' | 'deal' | 'success' | 'warning' | 'error' | 'category'
  category?: CategorySlug   // required when variant === 'category', selects the accent
  size?: 'sm' | 'md'
  children: React.ReactNode
}
```

---

## Chip

Added after the first implementation pass, once a real inconsistency showed
up: the deals page filtered by deal-type, category, *and* store using three
different active-state colors (accent blue, ink black, and a hardcoded
orange with no token behind it at all) even though all three were the same
control repeated three times. Badge doesn't fit this — a Badge is a static
label, and a filter pill is always clickable with a real active/inactive
state. Not in the original reference system; designed for this app.

### Variant axes

| Axis | Values |
|------|--------|
| `active` | `false` · `true` |
| `size` | `sm` · `md` |
| `disabled` | via native `disabled` attribute |

### Dimensions

| Size | Height | Padding (x) | Font |
|------|--------|----------------|------|
| md | 36px | 16 | 14px / Medium |
| sm | 30px | 12 | 12px / Medium |

Radius: full (pill). Icons (e.g. a trailing `X` to signal "click to
remove") are composed by the caller as children, same as Badge — the
component only owns the active/inactive class logic.

### Colors

| State | Border | Background | Text |
|-------|--------|-------------|------|
| Inactive | `neutral-500` `#C4C0CE` | `neutral-0` | `text-muted` |
| Inactive hover | `primary-500` (border+text) | `neutral-0` | `primary-500` |
| Active | `primary-600` | `primary-600` | white |
| Disabled | `neutral-300` | `neutral-100` | `neutral-600` |

Every filter/tag toggle in the app (deal-type, category, store, price
range, rating, tag search) uses the same active color — one violet, not
three unrelated colors depending on which filter group happened to render
it.

### Implementation pattern

```tsx
type ChipProps = {
  active?: boolean
  size?: 'sm' | 'md'
} & React.ButtonHTMLAttributes<HTMLButtonElement>
```

---

## Product Card

The single most-used component in the app — every grid on the site is
built from it. Not present in Autopay's set at all; specified here from
scratch to the same rigor as Button.

### Anatomy (top to bottom)

```
[ Save — round overlay, top-left ]            [ Deal badge / ribbon — top-right ]
[ Image well — 4:3, object-contain on neutral-50 ]
[ Brand — 12px, text-muted ]
[ Product name — 14px Semibold, 2-line clamp; the title link is stretched over the whole card ]
[ RatingBadge (score + "/10") ]
[ Price (ink, Bold 16px)                    ☐ Compare — checkbox-style toggle ]
```

Nothing else. There is **no Quick view** (it only repeated what the card
already shows) and no strike-through price on the card (it made the price row
wrap). The whole card is one link; Save and Compare sit above it.

| Element | Spec |
|---------|------|
| Card | `rounded-xl`, `border`, no shadow → `shadow-md` on hover |
| Image | `aspect-[4/3]`, `object-contain p-3` (about 35% shorter than the old square) |
| Padding | `12px` phones, `16px` from `sm` |
| Save | `SaveButton variant="overlay"` — 36px circle with 44px hit-slop |
| Compare | 36px-high toggle with hit-slop; label shown from 420px up |

```tsx
type ProductCardProps = {
  product: ProductSummary
  activeDeal?: ProductDealBadge | null
  rank?: number; pickReason?: string
  highlight?: string      // wraps the match in <mark> (search)
  showCategory?: boolean
}
```

`ProductListRow` is the list-view sibling: same facts, one row.

---

## Score Ring

The creator-rating visual — a circular progress ring with the numeral
inside. Also original to this domain.

### Variant axes

| Axis | Values |
|------|--------|
| `size` | `sm` (32px, card badge) · `md` (64px, sidebar) · `lg` (88px, PDP hero) |
| `tone` | derived from score, not set directly (see below) |

### Tone derivation (score out of 10)

| Score | Tone | Ring color | Label |
|-------|------|-------------|-------|
| ≥ 9.0 | Excellent | `success-500` `#33CC85` | "Excellent" |
| 8.0–8.9 | Very Good | `primary-500` `#723EEA` | "Very Good" |
| 7.0–7.9 | Good | `secondary-500` `#F7A222` | "Good" |
| < 7.0 | Mixed | `neutral-600` `#AAA5B6` | "Mixed" |

Track (the unfilled part of the ring) is always `neutral-200` `#F1F0F5`.

### Dimensions

| Size | Diameter | Stroke width | Numeral size |
|------|----------|----------------|----------------|
| sm | 32px | 3px | 11px, Bold |
| md | 64px | 5px | 20px, Bold |
| lg | 88px | 6px | 26px, Bold |

The numeral is the one other place (besides price) where Bold is used
intentionally — see the typography deviation note in `DESIGN_SYSTEM.md`.

### Implementation pattern

```tsx
type ScoreRingProps = {
  score: number       // 0-10
  size?: 'sm' | 'md' | 'lg'
  label?: string       // optional caption below, e.g. "Creator Rating"
}
```

---

## Price

`components/ui/Price.tsx` is the one way a price is drawn
(cards, buy box, deals, compare, best-of).

```tsx
<Price value={79999} original={84999} showDiscount size="sm" | "md" | "lg" />
```

- The current price is **ink** (`text-primary`, Bold, tabular numerals) — not
  brand violet, so the violet buy button stays the loudest thing on screen.
- `original` (only when higher) renders struck through in `text-muted`;
  `showDiscount` adds a success "N% off" badge.
- Savings are `success-700`; time-limited deals use the amber `deal` button.
- Sizes: `sm` 16px (cards, rows) · `md` 18px · `lg` 30px (PDP buy box).

---

## Eyebrow

Small uppercase label above a headline or section — category label above a
PDP title, section labels ("BROWSE BY CATEGORY").

### Variant axes

| Axis | Values |
|------|--------|
| `tone` | `neutral` · `category` (uses category accent) |

### Dimensions

- Font: 12px, Medium, `uppercase`, `tracking-wide` (~0.05em)
- No background/pill by default — plain label. Use Badge (above) when a
  pill treatment is wanted.

### Colors

| Tone | Text |
|------|------|
| `neutral` | `text-muted` `#767184` |
| `category` | category `-500` accent (see `colors.md`) |

---

## Toggle

Switch control — filter toggles, settings.

### Variant axes

| Axis | Values |
|------|--------|
| `state` | `default` · `pressed` · `disabled` |
| `active` | `off` · `on` |

### Dimensions

- Track: 32 × 20px, full radius
- Thumb: 16 × 16px circle, `shadow-sm`

### Colors

| State + Active | Track | Thumb |
|------------------|-------|-------|
| Default + Off | `neutral-300` `#E7E4EC` | white |
| Default + On | `primary-700` `#4B24A8` | white |
| Pressed + Off | `neutral-400` | white |
| Pressed + On | `primary-800` | white |
| Disabled + Off | `neutral-200` | `neutral-100` |
| Disabled + On | `neutral-400` | `neutral-100` |

Animate thumb `transform: translateX(0 → 12px)` over `150ms ease-out`,
track color in parallel.

---

## Input

Text inputs — search bar, budget range, newsletter signup.

### Dimensions

| Size | Height | Padding (y/x) | Radius |
|------|--------|-----------------|--------|
| Medium (default) | 44px | 10 / 16 | 8px |

44px height is deliberate — it's also the minimum comfortable touch
target, so inputs never need a separate mobile-size variant.

### Colors

| State | Border | Background | Text |
|-------|--------|-------------|------|
| Default | `neutral-500` `#C4C0CE` | `neutral-0` | `text-primary` |
| Focus | `primary-500` `#723EEA`, 2px | `neutral-0` | `text-primary` |
| Error | `error-500` `#E74B51`, 2px | `error-50` | `text-primary` |
| Disabled | `neutral-300` | `neutral-100` | `neutral-600` |

Placeholder text: `text-muted` `#767184`.

---

## Interaction & layout rules

These apply across the app and are the reason several primitives changed
after launch. New screens should follow them without re-deriving them.

### Touch targets: 44px
Every control a thumb can hit is at least 44×44px.
- `Button` size `sm` is 44px (was 38px); `md` is 48px; `auto` has no height of
  its own, so give it `h-11`.
- `Chip` stays visually compact (30/36px) but carries invisible hit-slop via an
  `after:` pseudo-element that extends the touch target to 44px.
- Icon-only buttons use `h-11 w-11`. Text links in dense areas use
  `min-h-11 inline-flex items-center`.
- `Input` and `<select>` are `h-11`; `Input` text is 16px below `sm` so iOS does
  not zoom on focus.

### Fixed bottom layers
Tab bar, compare tray, sticky buy bar and cookie banner share the bottom edge.
Each publishes its measured height with `useBottomLayer(name)`
(`lib/hooks/useBottomLayer.ts`) as `--layer-<name>`, and sits on top of the
layers beneath it (`bottom-[calc(var(--layer-tabbar)_+_…)]`). Never hard-code
"the bar above me" offsets. `<body>` reserves matching bottom padding, and
`--navbar-height` is the live sticky-header height for `top-[…]` offsets.

### Dialogs and drawers
Anything modal uses `useDialog` (`lib/hooks/useDialog.ts`): focus moves in, Tab
is trapped, Escape closes, body scroll locks, focus returns to the opener (even
when the dialog contains an `autoFocus` field, e.g. the phone search sheet). The
panel gets `role="dialog"`, `aria-modal`, `aria-label` and `tabIndex={-1}`, and
is portaled above the fixed bars (`z-[70]`).

### Tabs
Use `Tabs.tsx` (`TabList` + `TabPanel`): `role=tablist/tab/tabpanel`, roving
tabindex, Arrow/Home/End keys. Variants: `underline` (page sections), `pill`
(content switchers), `segmented` (compact picker).

### Ratings, empty states, breadcrumbs
- `RatingBadge` is the creator-score treatment everywhere (cards, rows, results,
  product header, compare, best-of). The score appears **once** per page region
  — the product page shows it under the title only. `ScoreRing` remains
  available but is no longer used on the main pages. Same bands everywhere
  (`lib/utils/score.ts`).
- `EmptyState` takes `headingLevel`; pages whose only content is the empty state
  pass `1`. Its action is a `Button`.
- `Breadcrumb` renders the labelled `<nav>` + ordered list with `aria-current`.

### Money-path rules
- One primary action per context. Buying is primary; comparing, saving and
  alerts are secondary.
- "Best price" means the cheapest **in-stock** store (`getBestOffer`).
- Never present modelled data as measured: the price-trend chart is labelled
  "Illustrative", and price watches say they live on this device.
- Time-limited CTAs use `DealBuyLink` so an expired deal can't be clicked.

### Page rhythm, width and density (Round 2)
All gaps are decided in `components/ui/Section.tsx`, not per page.
- `Container` — `max-w-7xl`, `px-4 sm:px-6`. Every page `<main>` uses the same
  gutters so headers, content and footer align (legal pages: `max-w-3xl`).
- `Section` — vertical padding `32px` phones / `48px` desktop (`compact` 24/32);
  `tone="alt"` adds the soft full-bleed background. Never stack `py-12` + `mb-*`.
- `SectionHeader` — `h2` (`text-h2`) + optional one-line description + action link.
- `Rail` — swipe rail on phones (children ~68% wide), 4-column grid from `md`.
  Use it instead of a four-row phone grid.
- Type scale utilities: `text-h1` (24→28px), `text-h2` (20→22px), `text-h3` (17px).
- `ListingHeader` — the slim title row (title, one-line subtitle, count, controls)
  shared by category / brand / tag / search / deals / guides / My Stuff. No grey box.
- Page-height budgets we hold the layout to (1440px / 390px): home ≤ 2700 / 3600,
  product ≤ 3100 / 4000, category ≤ 1700 / 2400, search ≤ 1800 / 2400,
  deals ≤ 1400 / 2400.

### Header, tab bar, footer
- Header: one 56px row on phones (logo, menu; a search icon only on product
  pages, where the tab bar is hidden). Desktop: row 1 (64px) logo, search, Deals,
  Compare, My Stuff; row 2 (44px) categories, Top 10, Brands — row 2 collapses
  while scrolling down and returns on scroll up.
- Phone tab bar: Home · Search · Deals · Compare · My Stuff. Search opens a
  full-screen sheet (`SearchBar autoFocus` in a dialog) instead of a permanent
  search row.
- Footer: brand + newsletter, Explore, About (+ social). No repeated category list.

### Don't repeat yourself (audit rules)
- A product, number or action appears once per page. Examples enforced above:
  the home Deal of the Day is the first row of Today's deals (no separate band);
  the product page has one buy box, one rating, one share control, one
  "compare with" line; the deals page has no "ending soon" strip repeating the grid.
- Filters appear only when there is something to filter (deals ≥ 6; search
  filters only with a query or active filter). Budget bands live in the sidebar
  on desktop and in the quick-filter row on phones, never both.
- Click-to-load media (`VideoEmbed`): poster + play button, iframe only on click
  (`youtube-nocookie`); a failed poster still reads as a "Watch the video" tile.
