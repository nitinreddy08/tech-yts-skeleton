import { fetchAllCategories } from '@/lib/data/categories'
import { fetchBestOfLists } from '@/lib/data/best-of-lists'
import SiteFooter from '@/components/ui/Footer'

export default async function SiteFooterWrapper() {
  const [categories, bestOfLists] = await Promise.all([
    fetchAllCategories(),
    fetchBestOfLists(),
  ])

  return (
    <SiteFooter
      categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
      bestOfLists={bestOfLists.map((l) => ({ slug: l.slug, title: l.title }))}
    />
  )
}
