import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { HealthReport, PriceSnapshot, ScraperConfig, SourceOverride } from './types'

/** Node-only helpers (CLI / tests). The site itself imports data/prices.json directly and never touches fs. */

export function loadConfigs(dir: string): ScraperConfig[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const cfg = JSON.parse(readFileSync(join(dir, f), 'utf8')) as ScraperConfig
      if (!cfg.store || !Array.isArray(cfg.strategies) || !Array.isArray(cfg.hosts)) {
        throw new Error(`${f}: a scraper config needs "store", "hosts" and "strategies"`)
      }
      return cfg
    })
}

function readJson<T>(path: string, fallback: T): T {
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : fallback
}

export const loadSnapshot = (path: string) => readJson<PriceSnapshot>(path, { generated_at: null, entries: {} })
export const loadHealth = (path: string) => readJson<HealthReport>(path, { generated_at: null, stores: {} })
export const loadSources = (path: string) => readJson<Record<string, SourceOverride>>(path, {})
