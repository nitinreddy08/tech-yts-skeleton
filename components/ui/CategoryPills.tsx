import { Category } from '@/types'
import Link from 'next/link'
import {
  Tag,
  Smartphone,
  Laptop,
  Headphones,
  Tv,
  Camera,
  Watch,
  Gamepad2,
  Cpu,
  Speaker,
  LucideIcon,
} from 'lucide-react'

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  smartphones: Smartphone,
  laptop: Laptop,
  laptops: Laptop,
  headphones: Headphones,
  tv: Tv,
  television: Tv,
  camera: Camera,
  cameras: Camera,
  watch: Watch,
  watches: Watch,
  gaming: Gamepad2,
  cpu: Cpu,
  speaker: Speaker,
  speakers: Speaker,
}

interface CategoryPillsProps {
  categories: Category[]
  activeSlug?: string
}

export function CategoryPills({ categories, activeSlug }: CategoryPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      {categories.map((cat) => {
        const IconComponent = CATEGORY_ICON_MAP[cat.icon?.toLowerCase()] ?? Tag
        const isActive = cat.slug === activeSlug
        return (
          <Link
            key={cat.id}
            href={`/${cat.slug}`}
            className={[
              'flex items-center gap-2 px-4 h-9 rounded-full border text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-border bg-surface text-primary hover:border-accent/40',
            ].join(' ')}
          >
            <IconComponent size={16} />
            {cat.name}
          </Link>
        )
      })}
    </div>
  )
}
