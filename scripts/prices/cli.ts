/**
 * Price scraper CLI.
 *
 *   npm run prices:refresh [-- --store amazon] [--dry-run] [--accept-outliers] [--delay 2500]
 *       Reads every affiliate link with a real URL, writes data/prices.json + data/price-health.json.
 *       Exits 1 when a store is "broken" (its pages load but no price can be read) → run /update-scraper <store>.
 *   npm run prices:check   [-- --store amazon]
 *       Same as refresh --dry-run: reports health, writes nothing except fixtures of pages that failed to parse.
 *   npm run prices:inspect -- <linkId | url>
 *       Fetches one page and shows what each strategy finds. Saves the HTML for repairs.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { affiliateLinks } from '@/lib/mock/db'
import { loadConfigs, loadHealth, loadSnapshot, loadSources } from '@/lib/prices/load'
import { fetchJson, fetchPage } from '@/lib/prices/fetcher'
import { configFor, refreshPrices } from '@/lib/prices/refresh'
import { extractFromHtml, looksBlocked } from '@/lib/prices/extract'
import type { LinkResult, ScraperConfig } from '@/lib/prices/types'

const ROOT = resolve(__dirname, '..', '..')
const P = {
  configs: join(ROOT, 'config', 'price-scrapers'),
  snapshot: join(ROOT, 'data', 'prices.json'),
  health: join(ROOT, 'data', 'price-health.json'),
  sources: join(ROOT, 'data', 'price-sources.json'),
  fixtures: join(ROOT, 'data', 'price-fixtures'),
}

function parseArgs(argv: string[]) {
  const flags: Record<string, string | boolean> = {}
  const rest: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const next = argv[i + 1]
      if (next && !next.startsWith('--') && ['store', 'delay'].includes(a.slice(2))) {
        flags[a.slice(2)] = next
        i++
      } else flags[a.slice(2)] = true
    } else rest.push(a)
  }
  return { flags, rest }
}

const icon: Record<string, string> = { ok: '✓', failed: '✗', skipped: '–' }
const fmt = (r: LinkResult) => {
  const price = r.price != null ? `₹${r.price.toLocaleString('en-IN')}` : ''
  const was = r.previous != null && r.price != null && r.previous !== r.price ? ` (was ₹${r.previous.toLocaleString('en-IN')})` : ''
  const why = r.status === 'ok' ? `via ${r.via}` : `${r.reason}${r.detail ? ` — ${r.detail}` : ''}`
  return `${icon[r.status]} [${r.storeKey}] ${r.linkId}  ${price}${was}  ${why}`
}

function saveFixture(r: LinkResult) {
  if (!r.html) return null
  const dir = join(P.fixtures, r.storeKey)
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `${r.linkId}.html`)
  writeFileSync(file, r.html)
  return file.replace(`${ROOT}/`, '')
}

async function refresh(flags: Record<string, string | boolean>, dryRun: boolean) {
  const configs = loadConfigs(P.configs)
  const only = typeof flags.store === 'string' ? flags.store : undefined
  if (only && !configs.some((c) => c.store === only)) {
    console.error(`No config for store "${only}". Known: ${configs.map((c) => c.store).join(', ')}`)
    process.exit(2)
  }

  const { snapshot, results, health } = await refreshPrices({
    links: affiliateLinks,
    sources: loadSources(P.sources),
    configs,
    previous: loadSnapshot(P.snapshot),
    previousHealth: loadHealth(P.health),
    deps: {
      fetchPage,
      fetchJson,
      env: process.env,
      now: () => new Date(),
      sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    },
    delayMs: typeof flags.delay === 'string' ? Number(flags.delay) : 2500,
    onlyStore: only,
    acceptOutliers: flags['accept-outliers'] === true,
    onProgress: (r) => console.log(fmt(r)),
  })

  const saved = results.map(saveFixture).filter(Boolean)
  if (!dryRun) {
    writeFileSync(P.snapshot, JSON.stringify(snapshot, null, 2) + '\n')
    writeFileSync(P.health, JSON.stringify(health, null, 2) + '\n')
  }

  console.log('\nStore health')
  for (const [store, h] of Object.entries(health.stores)) {
    if (only && store !== only) continue
    console.log(`  ${store.padEnd(10)} ${h.status.padEnd(9)} ${h.ok}/${h.attempted} ok  ${JSON.stringify(h.failed)}`)
  }
  if (results.length === 0) console.log('  (no links matched — nothing to do)')
  if (saved.length) console.log(`\nSaved ${saved.length} page(s) that stopped parsing:\n  ${saved.join('\n  ')}`)
  console.log(dryRun ? '\nDry run: nothing written.' : '\nWrote data/prices.json and data/price-health.json.')

  const broken = Object.entries(health.stores).filter(([s, h]) => h.status === 'broken' && (!only || s === only))
  if (broken.length) {
    console.error(
      `\n✗ Layout changed for: ${broken.map(([s]) => s).join(', ')}.\n` +
        `  Fix it with:  /update-scraper ${broken[0][0]}   (in Claude Code)\n`
    )
    process.exit(1)
  }
}

async function inspect(target: string | undefined) {
  if (!target) {
    console.error('Usage: npm run prices:inspect -- <linkId | url>')
    process.exit(2)
  }
  const configs = loadConfigs(P.configs)
  const sources = loadSources(P.sources)
  const link = affiliateLinks.find((l) => l.id === target)
  const url = link ? (sources[link.id]?.url ?? link.affiliate_url) : target
  const cfg = configFor(url, configs)
  console.log(`URL:    ${url}\nConfig: ${cfg.store}\n`)

  const page = await fetchPage(url, { 'user-agent': 'Mozilla/5.0 Chrome/124.0', 'accept-language': 'en-IN,en;q=0.9', ...cfg.requestHeaders })
  console.log(`HTTP ${page.status}, ${page.html.length} bytes`)
  const dir = join(P.fixtures, 'inspect')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `${(link?.id ?? new URL(url).hostname).replace(/[^a-z0-9.-]/gi, '_')}.html`)
  writeFileSync(file, page.html)
  console.log(`Saved   ${file.replace(`${ROOT}/`, '')}\n`)

  const blocked = looksBlocked(page.html, cfg)
  if (blocked) console.log(`⚠ looks like a bot check (“${blocked}”)\n`)

  cfg.strategies.forEach((s, i) => {
    const only: ScraperConfig = { ...cfg, strategies: [s] }
    const r = extractFromHtml(page.html, only)
    const label = `${i + 1}. ${s.type}`
    console.log(r.ok ? `  ✓ ${label.padEnd(10)} ₹${r.price.toLocaleString('en-IN')}  ${r.stock ?? ''}  (${r.via})` : `  ✗ ${label.padEnd(10)} ${r.reason}${r.detail ? ` — ${r.detail}` : ''}`)
  })
  const all = extractFromHtml(page.html, cfg)
  console.log(`\nCombined: ${all.ok ? `₹${all.price.toLocaleString('en-IN')} via ${all.via}` : `FAILED (${all.reason})`}`)
}

async function main() {
  const [cmd, ...argv] = process.argv.slice(2)
  const { flags, rest } = parseArgs(argv)
  if (cmd === 'refresh') return refresh(flags, flags['dry-run'] === true)
  if (cmd === 'check') return refresh(flags, true)
  if (cmd === 'inspect') return inspect(rest[0])
  console.error('Usage: prices <refresh|check|inspect> [options]   (see the header of scripts/prices/cli.ts)')
  process.exit(2)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
