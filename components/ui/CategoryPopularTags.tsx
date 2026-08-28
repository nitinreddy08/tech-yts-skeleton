import Link from 'next/link'
import { Hash } from 'lucide-react'
import { Chip } from '@/components/ui/Chip'
import type { CategoryTagCount } from '@/lib/data/category-tags'

interface CategoryPopularTagsProps {
  categoryName: string
  tags: CategoryTagCount[]
}

export function CategoryPopularTags({ categoryName, tags }: CategoryPopularTagsProps) {
  if (tags.length === 0) return null

  return (
    <section className="mb-6 rounded-xl border border-border bg-surface-alt/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Hash size={16} className="text-accent" />
        <h2 className="text-sm font-semibold text-primary">
          Popular in {categoryName}
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Chip key={tag.slug} href={`/tag/${tag.slug}`} className="capitalize">
            {tag.label}
            <span className="text-[10px] text-muted tabular-nums">{tag.count}</span>
          </Chip>
        ))}
        <Link
          href="/tags"
          className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-accent hover:underline"
        >
          All tags →
        </Link>
      </div>
    </section>
  )
}
