import { db } from '@/lib/mock/db'

export interface FrequentCompare {
  label: string
  href: string
  slugs: string[]
}

const CURATED: FrequentCompare[] = [
  {
    label: 'OnePlus 13 vs Galaxy S25',
    slugs: ['oneplus-13', 'samsung-galaxy-s25'],
    href: '/compare/oneplus-13-vs-samsung-galaxy-s25',
  },
  {
    label: 'iPhone 16 vs Galaxy S25',
    slugs: ['apple-iphone-16', 'samsung-galaxy-s25'],
    href: '/compare/apple-iphone-16-vs-samsung-galaxy-s25',
  },
  {
    label: 'iPhone 16 vs OnePlus 13',
    slugs: ['apple-iphone-16', 'oneplus-13'],
    href: '/compare/apple-iphone-16-vs-oneplus-13',
  },
  {
    label: 'MacBook Air M3 vs iPad Air M2',
    slugs: ['macbook-air-m3', 'apple-ipad-air-m2'],
    href: '/compare/macbook-air-m3-vs-apple-ipad-air-m2',
  },
]

export function getFrequentComparesForProduct(productSlug: string, limit = 3): FrequentCompare[] {
  const sameCategory = db.products.find((p) => p.slug === productSlug)?.category_slug
  const curated = CURATED.filter(
    (c) => c.slugs.includes(productSlug) && c.slugs.every((s) => db.products.some((p) => p.slug === s && p.is_published))
  )

  if (curated.length >= limit) return curated.slice(0, limit)

  const extras = db.products
    .filter(
      (p) =>
        p.is_published &&
        p.slug !== productSlug &&
        p.category_slug === sameCategory &&
        !curated.some((c) => c.slugs.includes(p.slug))
    )
    .slice(0, limit - curated.length)
    .map((p) => ({
      label: `Compare with ${p.name.split(' ').slice(-2).join(' ')}`,
      slugs: [productSlug, p.slug],
      href: `/compare?products=${productSlug},${p.slug}`,
    }))

  return [...curated, ...extras].slice(0, limit)
}
