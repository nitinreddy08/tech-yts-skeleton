/**
 * Rule-based self-healing for one store (no AI):
 *
 *   npm run prices:heal -- --store amazon
 *
 * Reads the pages `prices:refresh` saved when the store stopped parsing (data/price-fixtures/<store>/),
 * looks for where the last known price lives now (lib/prices/discover.ts), and — only if exactly one
 * believable way to read it works on every saved page — adds it as the FIRST strategy in
 * config/price-scrapers/<store>.json. Exit 0 = config updated, 1 = could not heal (reason printed).
 * The caller (scripts/prices/ci-repair.sh) still verifies with tests and a live refresh before publishing.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { affiliateLinks } from '@/lib/mock/db'
import { discoverStrategy, type DiscoveryPage } from '@/lib/prices/discover'
import { loadSnapshot } from '@/lib/prices/load'
import type { ScraperConfig } from '@/lib/prices/types'

const ROOT = resolve(__dirname, '..', '..')
const idx = process.argv.indexOf('--store')
const store = idx > -1 ? process.argv[idx + 1] : undefined
if (!store) {
  console.error('Usage: npm run prices:heal -- --store <store>')
  process.exit(2)
}

const configPath = join(ROOT, 'config', 'price-scrapers', `${store}.json`)
const dir = join(ROOT, 'data', 'price-fixtures', store)
if (!existsSync(configPath)) {
  console.error(`No config for "${store}" (${configPath})`)
  process.exit(2)
}
if (!existsSync(dir)) {
  console.error(`No saved pages for "${store}" in data/price-fixtures/${store}/ — run \`npm run prices:refresh -- --store ${store}\` first.`)
  process.exit(1)
}

const snapshot = loadSnapshot(join(ROOT, 'data', 'prices.json'))
const pages: DiscoveryPage[] = []
for (const file of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
  const linkId = file.replace(/\.html$/, '')
  const previous = snapshot.entries[linkId]?.price_inr ?? affiliateLinks.find((l) => l.id === linkId)?.price_inr ?? 0
  pages.push({ html: readFileSync(join(dir, file), 'utf8'), previous })
}

const result = discoverStrategy(pages)
if (!result.ok) {
  console.error(`✗ Could not heal "${store}": ${result.reason}`)
  process.exit(1)
}

const config = JSON.parse(readFileSync(configPath, 'utf8')) as ScraperConfig & { healed?: unknown[] }
const key = JSON.stringify(result.discovery.strategy)
if (config.strategies.some((s) => JSON.stringify(s) === key)) {
  console.error(`✗ "${store}" already has this strategy, yet it does not read the pages — nothing new to add.`)
  process.exit(1)
}
config.strategies.unshift(result.discovery.strategy)
config.healed = [
  ...(config.healed ?? []).slice(-9),
  { at: new Date().toISOString().slice(0, 10), strategy: result.discovery.strategy, evidence: result.discovery.evidence },
]
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')

console.log(`✓ Healed "${store}" — new first strategy:\n  ${key}`)
for (const e of result.discovery.evidence) console.log(`  - ${e}`)
