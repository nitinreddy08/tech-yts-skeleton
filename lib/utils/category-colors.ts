/** Category slugs this app currently ships, plus a few reserved for
 *  categories not live yet — keeps the map future-proof without a
 *  hardcoded fallback color that would silently mismatch new categories.
 *  Values come from the category-* tokens in app/globals.css. Shared by
 *  Badge (tint background) and Eyebrow (text only). */
export const CATEGORY_TEXT_CLASSES: Record<string, string> = {
  smartphones: 'text-primary-700',
  laptops: 'text-[color:var(--category-laptops)]',
  headphones: 'text-[color:var(--category-headphones)]',
  tablets: 'text-[color:var(--category-tablets)]',
  wearables: 'text-[color:var(--category-wearables)]',
  gaming: 'text-[color:var(--category-gaming)]',
}

export const CATEGORY_TINT_CLASSES: Record<string, string> = {
  smartphones: 'bg-category-smartphones-tint',
  laptops: 'bg-category-laptops-tint',
  headphones: 'bg-category-headphones-tint',
  tablets: 'bg-category-tablets-tint',
  wearables: 'bg-category-wearables-tint',
  gaming: 'bg-category-gaming-tint',
}

export function categoryBadgeClasses(category?: string): string {
  if (!category || !CATEGORY_TINT_CLASSES[category]) return 'bg-neutral-100 text-muted'
  return `${CATEGORY_TINT_CLASSES[category]} ${CATEGORY_TEXT_CLASSES[category]}`
}

export function categoryTextClass(category?: string): string {
  return (category && CATEGORY_TEXT_CLASSES[category]) || 'text-muted'
}
