// Feature: ui-redesign, Property 20: All pages use max-w-7xl content width
// Validates: Requirements 16.6

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const PAGE_FILES = [
  'app/page.tsx',
  'app/search/page.tsx',
  'app/deals/page.tsx',
  'app/best-of/[slug]/page.tsx',
  'app/compare/[...slugs]/page.tsx',
  'app/[category]/page.tsx',
  'app/[category]/[product]/page.tsx',
]

describe('Layout constraints', () => {
  it('Property 20: all public pages contain max-w-7xl content width class', () => {
    PAGE_FILES.forEach((relPath) => {
      const fullPath = join(process.cwd(), relPath)
      const content = readFileSync(fullPath, 'utf-8')
      expect(content, `${relPath} should contain max-w-7xl`).toContain('max-w-7xl')
    })
  })
})
