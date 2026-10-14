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

### Variant axes

| Axis | Values |
|------|--------|
| `density` | `default` (grid) · `compact` (strip/carousel) · `row` (list view) |
| `state` | `default` · `hover` · `saved` |

### Anatomy (top to bottom, `default` density)

```
[ Save button — top-right overlay, 32×32px circle ]
[ Discount badge — top-left overlay, if on sale ]
[ Thumbnail image — 1:1 aspect ]
[ Brand name — 12px, text-muted ]
[ Product name — 14px, Medium, 2-line clamp ]
[ Rating badge (Score Ring, sm) + rating count ]
[ Price — Bold, 16px, primary text  |  strikethrough launch price, 12px, text-muted ]
[ Quick view · Compare — 12px links, gap-16 ]
```

### Dimensions

| Element | Spec |
|---------|------|
| Card padding | `12px` (density default), `8px` (compact) |
| Card radius | `16px` (`radius-lg`) |
| Card border | `1px solid neutral-300`, → `primary-300` on hover |
| Card shadow | none default → `shadow-md` on hover |
| Thumbnail radius | `12px` (one step under card radius) |
| Save button | 32×32px circle, `neutral-0` @ 90% opacity background, `shadow-sm` |
| Gap between elements | `8px` |

### Colors

| Element | Default | Hover |
|---------|---------|-------|
| Card border | `neutral-300` `#E7E4EC` | `primary-300` `#AF93F0` |
| Card background | `neutral-0` | `neutral-0` |
| Product name | `text-primary` | `text-primary` |
| Price | `text-primary`, **Bold** | `text-primary` |
| Discount badge | `error-500` bg, white text | — |
| Save icon (unsaved) | `neutral-600` | `neutral-800` |
| Save icon (saved) | `secondary-500` filled | — |

### Implementation pattern

```tsx
type ProductCardProps = {
  product: ProductSummary
  density?: 'default' | 'compact' | 'row'
  activeDeal?: Deal
}
```

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

## Price Block

The price + discount + launch-price composition, used identically on
product cards, the PDP buy box, and the sticky buy bar. Specified once here
so every instance stays visually consistent.

### Composition

```
[ Best price — Bold, primary text ]  [ Discount badge, if any ]
[ Launch price — strikethrough, text-muted, if discounted ]
[ EMI hint — text-muted, 12px, optional ]
```

### Sizes

| Context | Best price size | Launch price size |
|---------|-------------------|----------------------|
| Product card | 16px Bold | 12px |
| PDP buy box | 24px Bold | 14px |
| Sticky buy bar | 14px Bold | — (omitted, space-constrained) |

### Colors

- Best price: `text-primary`, **Bold**.
- Discount badge: `variant="discount"` Badge (see above).
- Launch price strikethrough: `text-muted`, regular weight,
  `text-decoration: line-through`.
- "You save X%": `success-700` on `success-100` background pill.

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
is trapped, Escape closes, body scroll locks, focus returns to the opener. The
panel gets `role="dialog"`, `aria-modal`, `aria-label` and `tabIndex={-1}`, and
is portaled above the fixed bars (`z-[70]`).

### Tabs
Use `Tabs.tsx` (`TabList` + `TabPanel`): `role=tablist/tab/tabpanel`, roving
tabindex, Arrow/Home/End keys. Variants: `underline` (page sections), `pill`
(content switchers), `segmented` (compact picker).

### Ratings, empty states, breadcrumbs
- `RatingBadge` is the compact creator-score treatment (cards, rows, results);
  `ScoreRing` is reserved for the product page and compare headers. Both use the
  same score bands (`lib/utils/score.ts`).
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
