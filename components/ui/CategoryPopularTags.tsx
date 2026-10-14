import Link from 'next/link'
import { Chip } from '@/components/ui/Chip'
import type { CategoryTagCount } from '@/lib/data/category-tags'

interface CategoryPopularTagsProps {
  categoryName: string
  tags: CategoryTagCount[]
}

/** One compact line of popular tags (scrolls sideways on phones) so products start higher on the page. */
export function CategoryPopularTags({ categoryName, tags }: CategoryPopularTagsProps) {
  if (tags.length === 0) return null

  return (
    <section aria-label={`Popular in ${categoryName}`} className="mb-4 flex items-center gap-3">
      <h2 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">Popular</h2>
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar py-1 lg:flex-wrap lg:overflow-visible">
        {tags.slice(0, 10).map((tag) => (
          <Chip key={tag.slug} href={`/tag/${tag.slug}`} className="shrink-0 capitalize">
            {tag.label}
            <span className="text-[11px] text-muted tabular-nums">{tag.count}</span>
          </Chip>
        ))}
        <Link
          href="/tags"
          className="inline-flex min-h-11 shrink-0 items-center px-2 text-xs font-semibold text-accent hover:underline"
        >
          All tags →
        </Link>
      </div>
    </section>
  )
}
