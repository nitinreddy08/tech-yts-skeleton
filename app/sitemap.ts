import type { MetadataRoute } from 'next'
import { db } from '@/lib/mock/db'
import { bestOfListRepository } from '@/lib/repositories'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/deals`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/best-of`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/tags`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.65 },
    { url: `${SITE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/how-we-test`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/affiliate-disclosure`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.35 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.35 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.35 },
  ]

  const categoryEntries: MetadataRoute.Sitemap = db.categories.map((category) => ({
    url: `${SITE_URL}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const productEntries: MetadataRoute.Sitemap = db.products
    .filter((p) => p.is_published)
    .map((product) => ({
      url: `${SITE_URL}/${product.category_slug}/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

  const bestOfEntries: MetadataRoute.Sitemap = (await bestOfListRepository.list()).map((list) => ({
    url: `${SITE_URL}/best-of/${list.slug}`,
    lastModified: list.updated_at ? new Date(list.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
  }))

  const brandEntries: MetadataRoute.Sitemap = db.brands.map((brand) => ({
    url: `${SITE_URL}/brand/${brand.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.65,
  }))

  const tagSlugs = new Set<string>()
  for (const p of db.products) {
    if (!p.is_published) continue
    for (const t of p.tags) tagSlugs.add(t.toLowerCase().replace(/\s+/g, '-'))
  }
  const tagEntries: MetadataRoute.Sitemap = [...tagSlugs].map((slug) => ({
    url: `${SITE_URL}/tag/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticPages, ...categoryEntries, ...productEntries, ...bestOfEntries, ...brandEntries, ...tagEntries]
}
