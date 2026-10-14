import { describe, it, expect } from 'vitest'
import { specWinners, specDirection, computeCompareScores, overallCompareWinner } from '../compare-scores'
import type { SpecDiffRow } from '@/types'

describe('specDirection', () => {
  it('treats weight-like specs as lower-is-better', () => {
    for (const k of ['weight', 'weight_g', 'thickness', 'latency_ms', 'price']) {
      expect(specDirection(k)).toBe('lower')
    }
  })
  it('treats size-like specs as neutral', () => {
    for (const k of ['driver_size', 'display_size', 'screen_size']) {
      expect(specDirection(k)).toBe('neutral')
    }
  })
  it('defaults everything else (and no key) to higher-is-better', () => {
    expect(specDirection('ram')).toBe('higher')
    expect(specDirection('battery_life')).toBe('higher')
    expect(specDirection(undefined)).toBe('higher')
  })
})

describe('specWinners', () => {
  it('crowns the highest value for higher-is-better specs', () => {
    expect(specWinners([8, 12, 6], 'ram')).toEqual([false, true, false])
  })

  it('crowns the LOWEST value for weight', () => {
    expect(specWinners([1.24, 1.6, 1.4], 'weight')).toEqual([true, false, false])
  })

  it('crowns nobody for neutral size specs', () => {
    expect(specWinners([40, 30], 'driver_size')).toEqual([false, false])
  })

  it('keeps ties as shared wins', () => {
    expect(specWinners([8, 8, 4], 'ram')).toEqual([true, true, false])
    expect(specWinners([1.2, 1.2, 2], 'weight')).toEqual([true, true, false])
  })

  it('ignores null values', () => {
    expect(specWinners([null, 5, 3], 'weight')).toEqual([false, false, true])
  })

  it('favours a feature one product has over one that lacks it', () => {
    expect(specWinners([true, false], 'wireless_charging')).toEqual([true, false])
  })

  it('returns no winners for plain text values', () => {
    expect(specWinners(['OLED', 'LCD'], 'display')).toEqual([false, false])
  })
})

describe('computeCompareScores', () => {
  const row = (specKey: string, values: SpecDiffRow['values']): SpecDiffRow => ({
    specKey,
    label: specKey,
    values,
    hasDiff: true,
  })

  it('scores the lighter product as the winner on weight', () => {
    const scores = computeCompareScores([row('weight', [1.2, 1.9])], 2)
    expect(scores[0].wins).toBe(1)
    expect(scores[1].wins).toBe(0)
    expect(overallCompareWinner(scores)).toBe(0)
  })

  it('skips rows with no winner so they do not inflate the total', () => {
    const scores = computeCompareScores([row('driver_size', [40, 30]), row('ram', [8, 12])], 2)
    expect(scores[0].total).toBe(1)
    expect(scores[1].wins).toBe(1)
  })
})
