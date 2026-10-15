import Link from 'next/link'
import Image from 'next/image'
import { Trophy, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Price } from '@/components/ui/Price'
import type { BestOfList } from '@/types'

interface BestOfPreviewCardProps {
  list: BestOfList
}

export function BestOfPreviewCard({ list }: BestOfPreviewCardProps) {
  const topPick = list.items.find((i) => i.rank === 1)?.product

  return (
    <Link
      href={`/best-of/${list.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-accent/10 to-surface-alt">
        {topPick?.thumbnail_url ? (
          <Image
            src={topPick.thumbnail_url}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 object-contain drop-shadow-md transition-transform group-hover:scale-105"
          />
        ) : list.cover_image_url ? (
          <Image src={list.cover_image_url} alt="" fill className="object-cover" />
        ) : (
          <Trophy size={36} className="text-accent/40" />
        )}
        <Badge variant="accent" size="sm" className="absolute left-3 top-3">
          <Trophy size={10} aria-hidden /> Top {list.items.length}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-primary transition-colors group-hover:text-accent">
          {list.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted">{list.description}</p>
        {topPick && (
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="min-w-0 truncate text-sm text-muted">
              <span className="font-medium text-primary">#1</span> {topPick.name}
            </p>
            <Price value={topPick.current_price_inr} size="sm" className="shrink-0" />
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
          Read the guide <ArrowRight size={14} aria-hidden />
        </span>
      </div>
    </Link>
  )
}
