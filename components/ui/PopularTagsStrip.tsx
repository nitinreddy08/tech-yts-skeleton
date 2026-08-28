import Link from 'next/link'
import { Hash } from 'lucide-react'
import { fetchAllTags } from '@/lib/data/tags'

export async function PopularTagsStrip({ limit = 14 }: { limit?: number }) {
  const tags = await fetchAllTags()
  const popular = tags.slice(0, limit)

  if (popular.length === 0) return null

  const maxCount = popular[0]?.count ?? 1

  return (
    <section className="py-10 px-4 border-t border-border bg-surface-alt/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-primary flex items-center gap-2">
              <Hash size={18} className="text-accent" />
              Browse by Tag
            </h2>
            <p className="text-sm text-muted mt-0.5">
              Find phones, laptops &amp; gear by feature — 5G, gaming, ANC &amp; more
            </p>
          </div>
          <Link href="/tags" className="text-xs text-accent hover:underline shrink-0">
            All tags →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {popular.map((tag) => {
            const weight =
              tag.count >= maxCount * 0.75
                ? 'text-sm font-semibold px-4 py-2'
                : tag.count >= maxCount * 0.4
                  ? 'text-xs font-medium px-3 py-1.5'
                  : 'text-xs px-3 py-1.5'

            return (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-surface hover:border-accent hover:text-accent transition-colors text-primary ${weight}`}
              >
                {tag.label}
                <span className="text-[10px] text-muted tabular-nums">{tag.count}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
