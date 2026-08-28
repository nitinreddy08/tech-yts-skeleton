/**
 * Renders a brand mark as a colored monogram badge rather than an <img>.
 *
 * No brand in the seed data has a real logo asset (Brand.logo_url is always
 * null — nothing in this codebase renders it), and hotlinking third-party
 * logo CDNs isn't reliable here (some are blocked at the network level in
 * this environment, and it's not verifiable that a given brand-logo CDN
 * would resolve wherever this app is actually deployed for a demo). A
 * deterministic, brand-colored monogram is a real, common pattern (Slack,
 * Linear, GitHub org avatars) and has zero network dependency.
 */
const PALETTE = [
  { bg: '#EEF2FF', fg: '#4338CA' },
  { bg: '#ECFEFF', fg: '#0E7490' },
  { bg: '#FEF2F2', fg: '#B91C1C' },
  { bg: '#F0FDF4', fg: '#15803D' },
  { bg: '#FFF7ED', fg: '#C2410C' },
  { bg: '#FAF5FF', fg: '#7E22CE' },
  { bg: '#FDF2F8', fg: '#BE185D' },
  { bg: '#F0F9FF', fg: '#0369A1' },
]

function paletteFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
} as const

interface BrandLogoProps {
  name: string
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

export function BrandLogo({ name, size = 'md', className = '' }: BrandLogoProps) {
  const { bg, fg } = paletteFor(name)
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-xl font-heading font-bold ${SIZE_CLASSES[size]} ${className}`}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
