import { describe, it, expect } from 'vitest'
import { validateRepair, MAX_FIXTURE_BYTES, type RepairChange } from '../guard'
import type { ScraperConfig } from '../types'

const before: ScraperConfig = {
  store: 'amazon',
  hosts: ['amazon.in'],
  strategies: [{ type: 'css', selectors: ['.old'] }],
  minPrice: 500,
  maxPrice: 400000,
  samples: [{ fixture: 'lib/prices/__tests__/fixtures/a.html', expectedPrice: 79999 }],
}
const path = 'config/price-scrapers/amazon.json'
const fixed = (patch: Partial<ScraperConfig> = {}): RepairChange[] => [
  { path, before, after: { ...before, strategies: [{ type: 'css', selectors: ['.new'] }, ...before.strategies], ...patch } },
  { path: 'lib/prices/__tests__/fixtures/amazon-202609.html', bytes: 4000 },
]

describe('validateRepair', () => {
  it('accepts a selector fix plus a new sample', () => {
    expect(validateRepair(fixed())).toEqual([])
  })

  it('rejects an empty repair', () => {
    expect(validateRepair([])).toHaveLength(1)
  })

  it.each([
    ['code', [{ path: 'lib/prices/extract.ts' }], /not an allowed file/],
    ['workflow', [{ path: '.github/workflows/refresh-prices.yml' }], /not an allowed file/],
    ['package.json', [{ path: 'package.json' }], /not an allowed file/],
    ['another script', [{ path: 'scripts/prices/ci-repair.sh' }], /not an allowed file/],
    ['deletion', [{ path, deleted: true }], /deleting/],
    ['huge fixture', [{ path: 'lib/prices/__tests__/fixtures/x.html', bytes: MAX_FIXTURE_BYTES + 1 }], /trim/],
  ] as [string, RepairChange[], RegExp][])('rejects %s', (_, changes, re) => {
    expect(validateRepair(changes).join('\n')).toMatch(re)
  })

  it.each([
    ['hosts', { hosts: ['evil.example'] }, /hosts/],
    ['store', { store: 'other' }, /store/],
    ['api', { api: { url: 'https://evil.example/{id}', pricePath: 'x' } }, /api/],
    ['requestHeaders', { requestHeaders: { cookie: 'x' } }, /requestHeaders/],
    ['lower minPrice', { minPrice: 1 }, /minPrice/],
    ['higher maxPrice', { maxPrice: 9_000_000 }, /maxPrice/],
    ['dropped sample', { samples: [] }, /sample/],
    ['edited expected price', { samples: [{ fixture: 'lib/prices/__tests__/fixtures/a.html', expectedPrice: 1 }] }, /sample/],
    ['no strategies', { strategies: [] }, /strategy/],
  ] as [string, Partial<ScraperConfig>, RegExp][])('rejects a config that changes %s', (_, patch, re) => {
    expect(validateRepair(fixed(patch)).join('\n')).toMatch(re)
  })

  it('flags an unparseable config', () => {
    expect(validateRepair([{ path, before, after: null }]).join('\n')).toMatch(/valid JSON/)
  })

  it('allows tightening the bounds and adding samples', () => {
    const extra = { fixture: 'lib/prices/__tests__/fixtures/b.html', expectedPrice: 1 }
    expect(validateRepair(fixed({ minPrice: 1000, maxPrice: 300000, samples: [...before.samples!, extra] }))).toEqual([])
  })

  it('accepts a brand-new store config', () => {
    const fresh: ScraperConfig = { store: 'croma', hosts: ['croma.com'], strategies: [{ type: 'jsonld' }] }
    expect(validateRepair([{ path: 'config/price-scrapers/croma.json', before: null, after: fresh }])).toEqual([])
  })
})
