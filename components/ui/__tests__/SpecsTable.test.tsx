// Feature: ui-redesign, Property 7: Alternating row backgrounds in tables

/**
 * Property-based tests for SpecsTable
 * Validates: Requirements 7.5, 13.5
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import * as fc from 'fast-check'
import { SpecsTable } from '../SpecsTable'
import type { SpecTemplate } from '@/types'

vi.mock('next/image', () => ({ default: (props: any) => <img {...props} /> }))

// Arbitrary: generate a SpecTemplate with 2–10 fields, each with a unique key and label
const specTemplateArb: fc.Arbitrary<SpecTemplate> = fc
  .integer({ min: 2, max: 10 })
  .chain((n) =>
    fc
      .uniqueArray(fc.string({ minLength: 1, maxLength: 20, unit: 'grapheme-ascii' }), {
        minLength: n,
        maxLength: n,
      })
      .chain((keys) =>
        fc
          .uniqueArray(fc.string({ minLength: 1, maxLength: 30, unit: 'grapheme-ascii' }), {
            minLength: n,
            maxLength: n,
          })
          .map((labels) => ({
            fields: keys.map((key, i) => ({
              key,
              label: labels[i],
              type: 'text' as const,
            })),
          }))
      )
  )

// Arbitrary: generate a specifications record where all field keys have non-null string values
const specsArb = (template: SpecTemplate): fc.Arbitrary<Record<string, string>> =>
  fc.record(
    Object.fromEntries(
      template.fields.map((f) => [
        f.key,
        fc.string({ minLength: 1, maxLength: 50, unit: 'grapheme-ascii' }),
      ])
    )
  ) as fc.Arbitrary<Record<string, string>>

describe('SpecsTable', () => {
  /**
   * Property 7: Alternating row backgrounds in tables
   * Validates: Requirements 7.5, 13.5
   */
  it('Property 7: rows alternate between bg-surface (even) and bg-surface-alt (odd), no two adjacent rows share the same background', () => {
    fc.assert(
      fc.property(
        specTemplateArb.chain((template) =>
          specsArb(template).map((specs) => ({ template, specs }))
        ),
        ({ template, specs }) => {
          const { container } = render(
            <SpecsTable specifications={specs} template={template} />
          )

          const rows = Array.from(container.querySelectorAll('tbody tr'))

          // All fields have non-null values so all rows should be rendered
          expect(rows.length).toBe(template.fields.length)

          const hasClass = (el: Element, cls: string) =>
            el.classList.contains(cls)

          rows.forEach((row, i) => {
            if (i % 2 === 0) {
              expect(hasClass(row, 'bg-surface')).toBe(true)
              expect(hasClass(row, 'bg-surface-alt')).toBe(false)
            } else {
              expect(hasClass(row, 'bg-surface-alt')).toBe(true)
              expect(hasClass(row, 'bg-surface')).toBe(false)
            }
          })

          // No two adjacent rows share the same background class
          for (let i = 0; i < rows.length - 1; i++) {
            const currIsEven = hasClass(rows[i], 'bg-surface') && !hasClass(rows[i], 'bg-surface-alt')
            const nextIsEven = hasClass(rows[i + 1], 'bg-surface') && !hasClass(rows[i + 1], 'bg-surface-alt')
            expect(currIsEven).not.toBe(nextIsEven)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
