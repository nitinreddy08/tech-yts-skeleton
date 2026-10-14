import type { SpecTemplate } from '@/types'
interface SpecsTableProps {
  specifications: Record<string, string | number | boolean | null>
  template: SpecTemplate
}

function formatValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export function SpecsTable({ specifications, template }: SpecsTableProps) {
  if (!template.fields.length) return null

  const visibleFields = template.fields.filter((f) => {
    const v = specifications[f.key]
    return v !== null && v !== undefined
  })

  const groups = new Map<string, typeof visibleFields>()
  for (const field of visibleFields) {
    const group = field.group ?? 'General'
    if (!groups.has(group)) groups.set(group, [])
    groups.get(group)!.push(field)
  }

  const hasMultipleGroups = groups.size > 1

  if (!hasMultipleGroups) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
        <table className="w-full text-sm">
          <tbody>
            {visibleFields.map((field, i) => (
              <tr key={field.key} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt'}>
                <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-muted">
                  {field.label}
                  {field.unit && <span className="ml-1 text-xs text-muted">({field.unit})</span>}
                </th>
                <td className="px-4 py-3 text-primary">{formatValue(specifications[field.key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([group, fields]) => (
        <section key={group} id={`spec-group-${group.toLowerCase().replace(/\s+/g, '-')}`}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2 scroll-mt-32">
            {group}
          </h3>
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
            <table className="w-full text-sm">
              <tbody>
                {fields.map((field, i) => (
                  <tr key={field.key} className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-alt'}>
                    <th scope="row" className="w-2/5 px-4 py-3 text-left font-medium text-muted">
                      {field.label}
                      {field.unit && <span className="ml-1 text-xs text-muted">({field.unit})</span>}
                    </th>
                    <td className="px-4 py-3 text-primary">{formatValue(specifications[field.key])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
