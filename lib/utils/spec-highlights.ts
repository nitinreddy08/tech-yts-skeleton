import type { SpecField, SpecTemplate } from '@/types'

export interface SpecHighlight {
  key: string
  label: string
  value: string
  icon?: string
}

const SPEC_ICONS: Record<string, string> = {
  display: '📺',
  processor: '⚡',
  ram: '🧠',
  storage: '💾',
  battery: '🔋',
  camera: '📷',
  os: '📱',
  '5g': '📶',
  anc: '🔇',
  battery_life: '🔋',
  weight: '⚖️',
  type: '🎧',
  connectivity: '🔗',
  stylus: '✏️',
}

/** Keys to surface above the fold per category — GSMArena / 91Mobiles pattern */
const HIGHLIGHT_KEYS: Record<string, string[]> = {
  smartphones: ['display', 'processor', 'ram', 'storage', 'battery', 'camera', '5g'],
  laptops: ['display', 'processor', 'ram', 'storage', 'battery_life', 'weight'],
  headphones: ['type', 'connectivity', 'anc', 'battery', 'driver_size'],
  tablets: ['display', 'processor', 'ram', 'storage', 'battery', 'stylus'],
}

function formatSpecValue(field: SpecField, raw: string | number | boolean | null): string | null {
  if (raw == null || raw === '') return null

  if (field.type === 'boolean') {
    return raw === true ? 'Yes' : raw === false ? 'No' : null
  }

  if (field.type === 'number' && typeof raw === 'number') {
    return field.unit ? `${raw}${field.unit}` : String(raw)
  }

  return String(raw)
}

export function getSpecHighlights(
  categorySlug: string,
  specTemplate: SpecTemplate,
  specifications: Record<string, string | number | boolean | null>
): SpecHighlight[] {
  const keys = HIGHLIGHT_KEYS[categorySlug] ?? specTemplate.fields.slice(0, 6).map((f) => f.key)
  const fieldMap = Object.fromEntries(specTemplate.fields.map((f) => [f.key, f]))

  const highlights: SpecHighlight[] = []

  for (const key of keys) {
    const field = fieldMap[key]
    if (!field) continue
    const formatted = formatSpecValue(field, specifications[key] ?? null)
    if (!formatted) continue
    highlights.push({
      key,
      label: field.label.replace(/\s*\([^)]*\)/, ''),
      value: formatted,
      icon: SPEC_ICONS[key],
    })
    if (highlights.length >= 6) break
  }

  return highlights
}
