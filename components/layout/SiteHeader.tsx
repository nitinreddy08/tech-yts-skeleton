import { fetchAllCategories } from '@/lib/data/categories'
import { fetchBestOfLists } from '@/lib/data/best-of-lists'
import { fetchActiveDeals } from '@/lib/data/deals'
import Navbar from '@/components/ui/Navbar'

export default async function SiteHeader() {
  const [categories, bestOfLists, deals] = await Promise.all([
    fetchAllCategories(),
    fetchBestOfLists(),
    fetchActiveDeals(),
  ])

  return (
    <Navbar
      categories={categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        icon: c.icon,
      }))}
      bestOfLists={bestOfLists.map((l) => ({
        slug: l.slug,
        title: l.title,
        itemCount: l.items.length,
      }))}
      activeDealCount={deals.length}
    />
  )
}
