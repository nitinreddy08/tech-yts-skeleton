# Verdict Design System 1.0 — Canonical Reference

The design system for tech-yts-skeleton, built from scratch for a white-label
tech-creator affiliate / product-comparison platform. Structured the same way
a mature production design system is structured — full color scales, a
12-step type scale, a 4px spacing scale, a documented radius/shadow curve,
and discriminated-prop component specs — but every color, and every
domain-specific component, is original to this product.

This is `design-system/`, a standalone reference. It is **not yet wired into
the app** — `app/globals.css` still holds the app's current minimal token
set. Implementation is a separate follow-up pass; this package is the spec
to implement against.

---

## Brand identity in 30 seconds

- **Primary color**: `#723EEA` (Signal Violet, `primary-500`). The
  actionable button-fill variant is `#4B24A8` (`primary-700`) — darker reads
  better as a solid fill than the 500 step.
- **Secondary color**: `#F7A222` (Deal Amber, `secondary-500`). Reserved for
  hero CTAs, "Deal of the Day" badges, and other moments that need to pop —
  not a general-purpose accent.
- **Brand ink**: `#18151E` (violet-tinted near-black). Body text and the
  dark logo lockup. **Never `#000000`.**
- **Dark-mode surface**: `#0E0C13`.
- **Heading font**: existing `--font-heading` (Geist Sans, already
  integrated via `next/font`, free/open license).
- **Body font**: existing `--font-body` (Inter, already integrated).
- No new font families are introduced — see [Typography](#typography) for
  why, and how the scale still carries the brand without a licensed
  typeface.

---

## Why these colors

Autopay's system pairs a cool, confident primary (blue) with a vivid,
sparingly-used secondary (pistachio) reserved for "wow" moments. That
*contrast strategy* — one hue that carries trust and everyday actions, one
hue that's rationed for urgency and stands out precisely because it's rare —
is worth keeping. The hues themselves are not: blue is already this app's
current accent (`#0066FF`) and pistachio-green is Autopay's own mark, so
both were replaced outright.

- **Signal Violet** (primary) reads as premium and editorial rather than
  generic "tech blue" — appropriate for a site whose core value prop is a
  creator's *verdict*, not a utility dashboard.
- **Deal Amber** (secondary) does double duty semantically: amber/gold is
  the color shoppers already associate with "limited time" and "% off," so
  it's rationed the same way Autopay rations pistachio — hero CTA, deal
  badges, nothing else.
- **Neutrals** are a warm, violet-tinted gray scale (not cool blue-gray)
  built by holding a small amount of the primary's hue at low saturation
  through every step — a standard technique for making a neutral scale feel
  like it belongs to the brand instead of being generic Tailwind gray.
- **Success reuses green**, not the secondary amber — Autopay collapses
  secondary and success onto one pistachio token, but on a shopping site
  "20% off" (amber) and "in your budget" (green) need to stay visually
  distinct, so this system keeps them as separate scales.

---

## Color system

Full reference with every step and semantic aliases: `colors.md`. Each
scale below runs `50 → 950` on a monotonic lightness curve (the same
technique Radix/Tailwind palettes use), generated in HSL so every scale is
internally consistent rather than hand-picked.

### Brand scales

```
primary-50:  #F5F1FE    primary-600: #5722D3
primary-100: #E7DFFB    primary-700: #4B24A8  <- button fill
primary-200: #D0BFF7    primary-800: #3E2183
primary-300: #AF93F0    primary-900: #301C5F
primary-400: #8D65EC    primary-950: #21143D
primary-500: #723EEA  <- brand violet

secondary-50:  #FFF7EB  secondary-600: #DD8A0E
secondary-100: #FEEACD  secondary-700: #B3710F
secondary-200: #FDD69B  secondary-800: #8A590F
secondary-300: #FBC16A  secondary-900: #6B460F
secondary-400: #F9B043  secondary-950: #4E340E
secondary-500: #F7A222  <- deal amber
```

### Neutrals (Graphite scale)

```
neutral-0:    #FFFFFF  (BG white)
neutral-50:   #FEFDFE
neutral-100:  #F9F9FB  (soft section background)
neutral-200:  #F1F0F5
neutral-300:  #E7E4EC  (subtle dividers)
neutral-400:  #D9D6E0
neutral-500:  #C4C0CE  (default border)
neutral-600:  #AAA5B6  (disabled, dark subtext)
neutral-700:  #908A9E
neutral-800:  #767184  (light subtext)
neutral-900:  #585365
neutral-950:  #3A3546  (dark item background)
neutral-1000: #18151E  (brand ink — body text light mode)
neutral-dark: #0E0C13  (dark-mode background)
```

### Status colors

```
error-500:   #E74B51  (Coral Red — not pure red)
warning-500: #EFBE2A  (Golden Yellow — distinct from secondary amber)
success-500: #33CC85  (Emerald Green — "in budget", "in stock", savings)
info-500:    #5168EC  (Indigo Blue — informational callouts)
```

Each status color has a full `50–950` scale — see `colors.md`.

### Category accent palette (product-category branding)

Autopay color-codes each business solution; this system color-codes each
product category the same way, for chips, category tiles, and icon accents:

```
category-smartphones: #723EEA  (= primary-500)
category-laptops:     #30A69E
category-audio:       #DA4E99
category-tablets:     #30AEE8
category-wearables:   #EE7C2B
category-gaming:      #E24236
```

### Semantic tokens (prefer these in component code)

Aliases over the palette that can swap in dark mode: `bg-default`,
`bg-soft`, `bg-elevated`, `text-primary`, `text-secondary`, `text-link`,
`border-default`, `border-focus`, `interactive-primary`. Full table in
`colors.md`. Components written against semantic tokens get dark mode for
free; components written against raw palette tokens stay fixed (intentional
for force-light / force-dark contexts, e.g. the sticky buy bar).

---

## Typography

Full reference: `components.md` recipes section.

| Role | Font | Weight | Size (desktop) |
|------|------|--------|-----------------|
| H1 | Heading (Geist) | Regular/Semibold | 64px |
| H2 | Heading (Geist) | Regular/Semibold | 56px |
| H3 | Heading (Geist) | Regular/Semibold | 48px |
| H4 | Heading (Geist) | Semibold | 32px |
| H5 | Heading (Geist) | Semibold | 24px |
| H6 | Heading (Geist) | Semibold | 20px |
| Body L (default) | Body (Inter) | Regular/Medium | 16px |
| Button medium | Body (Inter) | Medium | 16px |
| Price / rating numerals | Body (Inter) | **Bold** | varies |

**Mobile heading scale** (~30% smaller): H1 48 / H2 40 / H3 32 / H4 24 / H5
20 / H6 18. **Tablet**: H1 56 / H2 48 / H3 48 / H4 32 / H5 24 / H6 20.

Line heights: H1–H3 = 1.1 (tight), H4–H6 = 1.25 (snug), body = 1.5,
buttons/labels = 1.25.

**Why no new font families.** Autopay's Whyte Inktrap / ABC Whyte / Graphik
Cond are commercial, foundry-licensed faces — copying them would mean
copying an unlicensed asset, not "the styling." Geist and Inter are already
integrated in this app via `next/font` under open licenses, and they cover
the same functional roles (a display face for headings, a workhorse face
for body/UI) at production quality. What's worth carrying over from
Autopay's *type system* — and is carried over exactly — is the 12-step size
ladder, the responsive heading scale (desktop/tablet/mobile), and the
line-height rules above.

**One deliberate deviation from "no bold."** Autopay's system has no bold
weight at all — Medium carries every emphasis. This system keeps that
philosophy for body copy and UI labels (Medium, not Bold, for emphasis) but
makes one explicit exception: **price figures and the creator-rating
numeral may use Bold (700)**. On a comparison/shopping site those two
numbers are the primary scan targets — Amazon, Flipkart, and every
price-comparison UI weight them heaviest for a reason — so this system
names the exception instead of silently overriding the rule everywhere.

---

## Spacing scale (4px base)

```
4, 8, 12, 16, 20, 24, 32, 40, 48, 52, 64, 80, 96
```

Identical to Autopay's scale — a 4px base spacing ladder is a structural
convention, not a brand asset, and this one is well-proven. Reusing it
exactly is "copying the styling" working as intended.

Common patterns:
- Button padding: `py-16 px-24` (medium), `py-12 px-24` (small)
- Card padding: `20` (product card), `32` (content section), `52` (hero)
- Text gaps: `8` within a paragraph, `16` between elements, `24` between
  sections

Don't use 5, 6, 7, 9, 10, 14, etc. unless a specific component spec
documents it.

---

## Border radius scale

```
radius-none: 0     radius-lg:  16    radius-3xl: 40   (hero/large containers)
radius-sm:   4     radius-xl:  24    radius-full: 9999 (pills, toggles, avatars, score ring)
radius-md:   8     radius-2xl: 28
```

Interactive elements (button, input, dropdown) default to `radius-md`
(8px). Product/content cards use `radius-lg` (16px) — one step softer than
Autopay's interactive default, matching this app's already-established
"friendly card" feel rather than a form-heavy dashboard's tighter corners.
Pills/toggles/badges/the score ring use full radius.

---

## Shadows

Same escalating 5-step elevation curve as Autopay, retinted to this
system's ink (`rgb(24 21 30)`) instead of Autopay's blue-black:

```
shadow-xs: 0 1px 2px 0 rgba(24,21,30,0.05)
shadow-sm: 0 2px 4px 0 rgba(24,21,30,0.08), 0 1px 2px 0 rgba(24,21,30,0.06)
shadow-md: 0 4px 8px 0 rgba(24,21,30,0.08), 0 2px 4px 0 rgba(24,21,30,0.06)
shadow-lg: 0 8px 16px 0 rgba(24,21,30,0.08), 0 4px 8px 0 rgba(24,21,30,0.06)
shadow-xl: 0 16px 32px 0 rgba(24,21,30,0.10), 0 8px 16px 0 rgba(24,21,30,0.08)
```

---

## Component summary

Detailed specs for the core set are in `components.md`.

- **Form controls**: Button, Input, Toggle, Badge/Tag
- **Content blocks**: Eyebrow, Product Card, Score Ring, Price Block, Text
  block
- **Feedback**: Deal badge, Status banner

### Variant naming convention

Every component variant follows `Type=<variant>, State=<state>,
Size=<size>`, mirrored in code as discriminated props. State is normally
CSS-driven (`:hover`, `:active`, `:focus-visible`, `:disabled`) — only pass
it as a prop when forcing a state for testing/storybook.

---

## The 10 working rules

1. **Reach for tokens first.** A raw hex, font-size, or pixel padding
   inline means stop and use the token.
2. **Brand ink is `#18151E`, not `#000000`.** Pure black is never used. For
   soft backgrounds use `neutral-100` (`#F9F9FB`).
3. **Headings = heading font, body = body font.** Don't mix them.
4. **Medium (500), not Bold, for emphasis** — except price figures and the
   creator-rating numeral, which may use Bold. See the typography
   deviation note above.
5. **Buttons fill with `primary-700` (`#4B24A8`), not `primary-500`.**
   `primary-500` is for accents and the brand mark.
6. **8px radius is the default for interactive elements; 16px for cards.**
   Pills/toggles/badges/score-ring use full radius; hero containers
   24–40px.
7. **Spacing uses the 4px scale.** No off-scale values without a component
   spec.
8. **Dark mode** uses semantic-token swaps, not naively darkened light
   tokens.
9. **Status colors**: error `#E74B51` (coral, not red), warning `#EFBE2A`
   (golden yellow, distinct from secondary amber), success `#33CC85`
   (green — kept separate from secondary, unlike Autopay's reused
   pistachio, because "% off" and "in budget" need to stay visually
   distinct on a shopping UI).
10. **Iconography**: outline-style, 1.5px stroke, 16/20/24px sizes —
    `lucide-react`, already the icon set used throughout this app.

---

## What's in this package

```
design-system/
├── DESIGN_SYSTEM.md   <- this file, canonical rules
├── colors.md           <- full palette (all scales) + semantic aliases
├── components.md       <- specs for Button, Badge, Product Card, Score
│                          Ring, Price Block, Eyebrow, Toggle, Input
├── tokens.css           <- CSS custom properties, drop-in ready
└── tokens.json          <- W3C design tokens (machine-readable)
```

## Implementation status

This package is a **spec, not yet wired into the app**. `app/globals.css`
still defines the current minimal token set (`--color-primary: #111111`,
`--color-accent: #0066FF`, two shadows, two radii). Implementing this
system means replacing that block with `tokens.css`'s contents (or
importing it) and updating components to the new variant props documented
in `components.md` — intentionally left as a separate, explicit next step.
