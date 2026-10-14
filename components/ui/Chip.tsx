import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export type ChipSize = 'sm' | 'md' | 'auto'

/** 'auto' sets no height/padding/text-size of its own — for callers that
 *  need custom sizing (e.g. a popularity-weighted tag cloud) but still
 *  want the shared border/color/radius treatment. */
const SIZE_CLASSES: Record<ChipSize, string> = {
  // `after:` pseudo-element adds invisible vertical hit-slop so the touch
  // target reaches 44px without making the pill itself visually chunky.
  md: "relative h-9 px-4 text-sm after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
  sm: "relative h-[30px] px-3 text-xs after:absolute after:inset-x-0 after:-inset-y-[7px] after:content-['']",
  auto: '',
}

export function chipVariants({
  active = false,
  size = 'sm',
  className = '',
}: {
  active?: boolean
  size?: ChipSize
  className?: string
} = {}): string {
  return cn(
    'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all select-none whitespace-nowrap',
    SIZE_CLASSES[size],
    active
      ? 'border-accent bg-accent text-white shadow-sm'
      : 'border-neutral-500 bg-surface text-muted hover:border-accent hover:text-accent',
    className
  )
}

interface ChipOwnProps {
  active?: boolean
  size?: ChipSize
  /** Renders a Next.js Link styled as a chip — for navigational tag pills
   *  that aren't a toggle (e.g. "browse by tag" links). */
  href?: string
}

type ChipAsButton = ChipOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ChipOwnProps | 'type'> & { href?: undefined }
type ChipAsLink = ChipOwnProps &
  Omit<React.ComponentProps<typeof Link>, keyof ChipOwnProps | 'href'> & { href: string }

export type ChipProps = ChipAsButton | ChipAsLink

/** Toggleable filter/tag pill (or, with `href`, a navigational tag link
 *  styled the same way) — distinct from Badge, a static, non-interactive
 *  label. */
export function Chip({ active = false, size = 'sm', className = '', ...props }: ChipProps) {
  const classes = chipVariants({ active, size, className })

  if (props.href !== undefined) {
    const { href, ...rest } = props as ChipAsLink
    return <Link href={href} className={classes} {...rest} />
  }

  return <button type="button" className={classes} {...(props as ChipAsButton)} />
}
