import Link from 'next/link'
import Image from 'next/image'
import { Trophy, ArrowRight } from 'lucide-react'
import { formatIndianPrice } from '@/lib/utils/format'
import { Badge } from '@/components/ui/Badge'
import type { BestOfList } from '@/types'

interface BestOfPreviewCardProps {
  list: BestOfList
}

export function BestOfPreviewCard({ list }: BestOfPreviewCardProps) {
  const topPick = list.items.find((i) => i.rank === 1)?.product

  return (
    <Link
      href={`/best-of/${list.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-surface overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all"
    >
      <div className="relative h-36 bg-gradient-to-br from-accent/10 to-surface-alt flex items-center justify-center">
        {topPick?.thumbnail_url ? (
          <Image
            src={topPick.thumbnail_url}
            alt={topPick.name}
            width={120}
            height={120}
            className="object-contain drop-shadow-md group-hover:scale-105 transition-transform"
          />
        ) : list.cover_image_url ? (
          <Image
            src={list.cover_image_url}
            alt={list.title}
            fill
            className="object-cover"
          />
        ) : (
          <Trophy size={40} className="text-accent/40" />
        )}
        <Badge variant="accent" size="sm" className="absolute top-3 left-3 uppercase tracking-wide">
          <Trophy size={10} aria-hidden /> Top {list.items.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3 className="font-semibold text-primary group-hover:text-accent transition-colors line-clamp-2">
          {list.title}
        </h3>
        <p className="text-xs text-muted line-clamp-2 flex-1">{list.description}</p>
        {topPick && (
          <div className="mt-2 pt-3 border-t border-border">
            <p className="text-[11px] uppercase tracking-wider text-muted mb-1">#1 Pick</p>
            <p className="text-sm font-medium text-primary line-clamp-1">{topPick.name}</p>
            {topPick.current_price_inr != null && (
              <p className="text-sm font-bold text-accent mt-0.5">
                {formatIndianPrice(topPick.current_price_inr)}
              </p>
            )}
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-1">
          Read full list <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}
