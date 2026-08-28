/**
 * lib/data/frequent-compares.ts
 */
import { productRepository } from '@/lib/repositories'

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

export async function getFrequentComparesForProduct(
  productSlug: string,
  limit = 3
): Promise<FrequentCompare[]> {
  const product = await productRepository.findBySlug(productSlug)
  const sameCategory = product?.category_slug

  const curatedChecks = await Promise.all(
    CURATED.map(async (c) => {
      if (!c.slugs.includes(productSlug)) return false
      const others = await Promise.all(c.slugs.map((s) => productRepository.findBySlug(s)))
      return others.every((p) => p !== null)
    })
  )
  const curated = CURATED.filter((_, i) => curatedChecks[i])

  if (curated.length >= limit) return curated.slice(0, limit)

  const extras = sameCategory
    ? (await productRepository.list({ categorySlug: sameCategory }))
        .filter((p) => p.slug !== productSlug && !curated.some((c) => c.slugs.includes(p.slug)))
        .slice(0, limit - curated.length)
        .map((p) => ({
          label: `Compare with ${p.name.split(' ').slice(-2).join(' ')}`,
          slugs: [productSlug, p.slug],
          href: `/compare?products=${productSlug},${p.slug}`,
        }))
    : []

  return [...curated, ...extras].slice(0, limit)
}
