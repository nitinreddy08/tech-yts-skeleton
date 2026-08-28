/**
 * UseCaseBadges — derives "who this is for" from tags and specs.
 * E.g. "5g" tag → "5G Ready", battery ≥5500 → "Battery Champion", etc.
 * Purely presentational — no user interaction needed.
 */

import { Wifi, Zap, Camera, Gamepad2, BookOpen, Briefcase, Music, Shield } from 'lucide-react'

interface UseCaseBadgesProps {
  tags: string[]
  specifications: Record<string, string | number | boolean | null>
}

interface Badge {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
}

export function UseCaseBadges({ tags, specifications }: UseCaseBadgesProps) {
  const badges: Badge[] = []
  const t = tags.map(x => x.toLowerCase())
  const battery = specifications['battery'] as number | null
  const ram = specifications['ram'] as number | null
  const camera = specifications['camera'] as number | null

  if (t.includes('5g') || specifications['5g'] === true)
    badges.push({ label: '5G Ready', icon: Wifi, color: 'bg-blue-50 text-blue-700 border-blue-200' })

  if (t.includes('fast-charging') || (battery && battery >= 5000))
    badges.push({ label: 'Battery Champion', icon: Zap, color: 'bg-amber-50 text-amber-700 border-amber-200' })

  if ((camera && camera >= 100) || t.includes('200mp'))
    badges.push({ label: 'Camera Powerhouse', icon: Camera, color: 'bg-purple-50 text-purple-700 border-purple-200' })

  if (t.includes('gaming') || (ram && ram >= 16))
    badges.push({ label: 'Gaming Beast', icon: Gamepad2, color: 'bg-red-50 text-red-700 border-red-200' })

  if (t.includes('budget') || t.includes('mid-range'))
    badges.push({ label: 'Value Pick', icon: Shield, color: 'bg-green-50 text-green-700 border-green-200' })

  if (t.includes('ultrabook') || t.includes('macos') || t.includes('laptop'))
    badges.push({ label: 'Work Ready', icon: Briefcase, color: 'bg-slate-50 text-slate-700 border-slate-200' })

  if (t.includes('anc') || t.includes('wireless'))
    badges.push({ label: 'Music & Focus', icon: Music, color: 'bg-pink-50 text-pink-700 border-pink-200' })

  if (t.includes('apple-intelligence') || t.includes('ai'))
    badges.push({ label: 'AI Features', icon: Zap, color: 'bg-violet-50 text-violet-700 border-violet-200' })

  if (t.includes('student') || t.includes('ipad') || t.includes('tablet'))
    badges.push({ label: 'Great for Students', icon: BookOpen, color: 'bg-teal-50 text-teal-700 border-teal-200' })

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.slice(0, 4).map((b) => (
        <span
          key={b.label}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${b.color}`}
        >
          <b.icon size={11} />
          {b.label}
        </span>
      ))}
    </div>
  )
}
