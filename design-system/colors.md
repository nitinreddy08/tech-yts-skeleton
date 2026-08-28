# Colors — Verdict Design System 1.0

Every scale runs `50 → 950` on a monotonic HSL lightness curve, so each step
is perceptually consistent within its scale — the same technique used by
mature systems like Radix Colors and Tailwind's default palette. Full
generation notes: fixed hue per scale, a saturation curve that peaks near
the middle steps, lightness descending linearly from ~97% to ~15%.

---

## Brand scales

### Primary — Signal Violet (hue 258°)

| Step | Hex | Typical use |
|------|-----|-------------|
| primary-50  | `#F5F1FE` | Tinted backgrounds, selected-row fill |
| primary-100 | `#E7DFFB` | Hover fill on ghost buttons |
| primary-200 | `#D0BFF7` | Focus-ring halo |
| primary-300 | `#AF93F0` | Disabled accent text |
| primary-400 | `#8D65EC` | Secondary links |
| primary-500 | `#723EEA` | **Brand mark, active/CTA text, focus ring** |
| primary-600 | `#5722D3` | Link hover |
| primary-700 | `#4B24A8` | **Button fill (default)** |
| primary-800 | `#3E2183` | Button fill hover |
| primary-900 | `#301C5F` | Button fill active/pressed |
| primary-950 | `#21143D` | Deepest accent, rarely used |

### Secondary — Deal Amber (hue 36°)

| Step | Hex | Typical use |
|------|-----|-------------|
| secondary-50  | `#FFF7EB` | Deal-badge tint background |
| secondary-100 | `#FEEACD` | Deal card soft fill |
| secondary-200 | `#FDD69B` | — |
| secondary-300 | `#FBC16A` | — |
| secondary-400 | `#F9B043` | — |
| secondary-500 | `#F7A222` | **Deal badge fill, hero "wow" CTA** |
| secondary-600 | `#DD8A0E` | Hover state |
| secondary-700 | `#B3710F` | Active/pressed, text-on-tint |
| secondary-800 | `#8A590F` | — |
| secondary-900 | `#6B460F` | — |
| secondary-950 | `#4E340E` | — |

Reserved. Secondary appears on the "Deal of the Day" badge, the single
hero CTA on the homepage, and nowhere else — the same discipline Autopay
applies to pistachio.

---

## Neutrals — Graphite scale (hue 258°, low saturation)

| Step | Hex | Typical use |
|------|-----|-------------|
| neutral-0    | `#FFFFFF` | Page/card background |
| neutral-50   | `#FEFDFE` | — |
| neutral-100  | `#F9F9FB` | Soft section background |
| neutral-200  | `#F1F0F5` | — |
| neutral-300  | `#E7E4EC` | Subtle dividers |
| neutral-400  | `#D9D6E0` | — |
| neutral-500  | `#C4C0CE` | **Default border** |
| neutral-600  | `#AAA5B6` | Disabled text, dark-mode subtext |
| neutral-700  | `#908A9E` | — |
| neutral-800  | `#767184` | **Secondary/muted text** |
| neutral-900  | `#585365` | — |
| neutral-950  | `#3A3546` | Dark-mode elevated surface |
| neutral-1000 | `#18151E` | **Brand ink — body text (light mode)** |
| neutral-dark | `#0E0C13` | Dark-mode page background |

---

## Status colors

Each has a full `50–950` scale, same lightness curve as above.

| Step | error (hue 358°) | warning (hue 45°) | success (hue 152°) | info (hue 231°) |
|------|-------------------|---------------------|----------------------|--------------------|
| 50  | `#FEECEC` | `#FFFAEB` | `#EDFCF5` | `#F0F3FE` |
| 100 | `#FBD0D1` | `#FDEFC3` | `#D4F7E7` | `#D9DEFC` |
| 200 | `#F7ABAE` | `#FBE193` | `#ABEDCE` | `#B5BFF8` |
| 300 | `#F2888B` | `#F7D56E` | `#83E2B6` | `#8C9CF2` |
| 400 | `#EC6569` | `#F3C949` | `#5CD69D` | `#6C80EF` |
| 500 | `#E74B51` | `#EFBE2A` | `#33CC85` | `#5168EC` |
| 600 | `#D9262C` | `#D3A417` | `#30A66F` | `#2C47DD` |
| 700 | `#B0272B` | `#AA8518` | `#2B825A` | `#273DB9` |
| 800 | `#892428` | `#816718` | `#266447` | `#273791` |
| 900 | `#652022` | `#625018` | `#1F4734` | `#222D6D` |
| 950 | `#43191A` | `#463A16` | `#173025` | `#1C234A` |

- **error-500** `#E74B51` — form validation, price-drop-expired states.
  Coral, not pure red.
- **warning-500** `#EFBE2A` — "price may be outdated," stock-low notices.
  Deliberately a cleaner yellow than secondary-500's orange-amber so the
  two never get confused on the same page.
- **success-500** `#33CC85` — "in budget," savings amount, in-stock,
  pros in the verdict widget.
- **info-500** `#5168EC` — informational banners, tooltips. Cooler and
  more blue than primary, so an info callout never reads as a CTA.

---

## Category accent palette

Color-codes each product category — chips on category tiles, category-icon
backgrounds, badge accents on category pages. Same idea as Autopay's
per-solution accent colors.

| Category | Hex | Light tint (`-100` equivalent) |
|----------|-----|----------------------------------|
| Smartphones | `#723EEA` (= primary-500) | `#E7DFFB` |
| Laptops | `#30A69E` | `#D3F1EE` |
| Audio / Headphones | `#DA4E99` | `#FBDCEC` |
| Tablets | `#30AEE8` | `#D2EFFB` |
| Wearables | `#EE7C2B` | `#FDE6D2` |
| Gaming | `#E24236` | `#FBDAD7` |

Add new categories by choosing an unused hue at the same saturation/lightness
as the table above (`s≈0.55–0.85`, `l≈0.42–0.58` in HSL) so new entries stay
visually consistent with the set.

---

## Semantic tokens

Prefer these names in component code — the raw palette scales above are
the source of truth they resolve to, and semantic names are what make dark
mode a token swap instead of a rewrite.

| Semantic token | Light value | Dark value |
|-----------------|-------------|--------------|
| `bg-default` | `neutral-0` `#FFFFFF` | `neutral-dark` `#0E0C13` |
| `bg-soft` | `neutral-100` `#F9F9FB` | `neutral-950` `#3A3546` |
| `bg-elevated` | `neutral-0` + `shadow-sm` | `neutral-900` `#585365` |
| `text-primary` | `neutral-1000` `#18151E` | `neutral-0` `#FFFFFF` |
| `text-muted` | `neutral-800` `#767184` | `neutral-600` `#AAA5B6` |
| `text-link` | `primary-600` `#5722D3` | `primary-300` `#AF93F0` |
| `border-default` | `neutral-500` `#C4C0CE` | `neutral-800` `#767184` |
| `border-focus` | `primary-500` `#723EEA` | `primary-400` `#8D65EC` |
| `interactive-primary` | `primary-700` `#4B24A8` | `primary-500` `#723EEA` |
| `interactive-primary-hover` | `primary-800` `#3E2183` | `primary-400` `#8D65EC` |
| `surface-deal` | `secondary-50` `#FFF7EB` | `secondary-950` `#4E340E` |

Dark mode is a **token swap**, not a naive darken-everything pass — several
mappings above intentionally pick a *different step* on the same scale
(e.g. `text-link` goes from `primary-600` to `primary-300`, not to a
darkened `primary-600`) so contrast stays correct against the dark
background.

**Naming note.** This table names the muted/secondary-emphasis text role
`text-muted`, not `text-secondary` — the app's existing `--color-muted`
token already implements it, and `text-secondary` is unusable here: Tailwind
resolves a `text-secondary` class against the `secondary` (Deal Amber)
brand scale, not a semantic "secondary text" concept, so the two would
collide. Earlier drafts of this doc used `text-secondary` for both meanings
before this was caught; `text-muted` is the only correct name going
forward.
