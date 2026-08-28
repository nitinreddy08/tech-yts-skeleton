import type { Category } from '@/types'

export interface SpecFilterOption {
  label: string
  /** Encoded as URL param value */
  value: string
}

export interface SpecFilterDef {
  key: string
  label: string
  options: SpecFilterOption[]
}

/**
 * Category-aware spec filters — 91Mobiles phone finder / GSMArena filter pattern.
 * Only surfaces specs that meaningfully narrow Indian buyer intent.
 */
export function getSpecFiltersForCategory(category: Category): SpecFilterDef[] {
  switch (category.slug) {
    case 'smartphones':
      return [
        {
          key: '5g',
          label: 'Network',
          options: [{ label: '5G', value: 'true' }],
        },
        {
          key: 'ram',
          label: 'RAM',
          options: [
            { label: '8GB+', value: '8' },
            { label: '12GB+', value: '12' },
          ],
        },
        {
          key: 'storage',
          label: 'Storage',
          options: [
            { label: '128GB+', value: '128' },
            { label: '256GB+', value: '256' },
          ],
        },
      ]
    case 'laptops':
      return [
        {
          key: 'ram',
          label: 'RAM',
          options: [
            { label: '8GB+', value: '8' },
            { label: '16GB+', value: '16' },
          ],
        },
        {
          key: 'storage',
          label: 'Storage',
          options: [
            { label: '256GB+', value: '256' },
            { label: '512GB+', value: '512' },
          ],
        },
      ]
    case 'headphones':
      return [
        {
          key: 'anc',
          label: 'ANC',
          options: [{ label: 'ANC', value: 'true' }],
        },
        {
          key: 'connectivity',
          label: 'Connectivity',
          options: [
            { label: 'Wireless', value: 'Wireless' },
            { label: 'Both', value: 'Both' },
          ],
        },
        {
          key: 'type',
          label: 'Type',
          options: [
            { label: 'Over-Ear', value: 'Over-Ear' },
            { label: 'In-Ear', value: 'In-Ear' },
          ],
        },
      ]
    case 'tablets':
      return [
        {
          key: 'stylus',
          label: 'Stylus',
          options: [{ label: 'Stylus support', value: 'true' }],
        },
        {
          key: 'ram',
          label: 'RAM',
          options: [
            { label: '8GB+', value: '8' },
            { label: '12GB+', value: '12' },
          ],
        },
      ]
    default:
      return []
  }
}

export function parseSpecFiltersFromParams(
  sp: Record<string, string | string[] | undefined>
): Record<string, string | number | boolean> {
  const specs: Record<string, string | number | boolean> = {}
  for (const [key, raw] of Object.entries(sp)) {
    if (!key.startsWith('spec_') || typeof raw !== 'string') continue
    const specKey = key.slice(5)
    if (raw === 'true') specs[specKey] = true
    else if (raw === 'false') specs[specKey] = false
    else if (/^\d+$/.test(raw)) specs[specKey] = Number(raw)
    else specs[specKey] = raw
  }
  return specs
}

export function specFilterParamKey(specKey: string): string {
  return `spec_${specKey}`
}
