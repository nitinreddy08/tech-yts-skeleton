/**
 * Checks what the automatic healer changed in the working tree against lib/prices/guard.ts.
 * Exit 0 = acceptable, 1 = rejected (reasons on stderr).
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { validateRepair, type RepairChange } from '@/lib/prices/guard'
import type { ScraperConfig } from '@/lib/prices/types'

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' })
const parse = (text: string | null): ScraperConfig | null => {
  try {
    return text ? (JSON.parse(text) as ScraperConfig) : null
  } catch {
    return null
  }
}

const changes: RepairChange[] = []
for (const line of git('status', '--porcelain', '-uall').split('\n').filter(Boolean)) {
  const status = line.slice(0, 2)
  const path = line.slice(3).replace(/^"|"$/g, '')
  // Files the verification steps write themselves, and ignored scratch space, are not the healer's.
  if (path === 'data/prices.json' || path === 'data/price-health.json' || path.startsWith('data/price-fixtures/')) continue
  const deleted = status.includes('D')
  const c: RepairChange = { path, deleted }
  if (!deleted && existsSync(path)) {
    c.bytes = statSync(path).size
    if (path.endsWith('.json')) {
      c.after = parse(readFileSync(path, 'utf8'))
      try {
        c.before = parse(git('show', `HEAD:${path}`))
      } catch {
        c.before = null // new file
      }
    }
  }
  changes.push(c)
}

const problems = validateRepair(changes)
if (problems.length) {
  console.error('Repair rejected:\n' + problems.map((p) => `  - ${p}`).join('\n'))
  process.exit(1)
}
console.log(`Repair accepted: ${changes.map((c) => c.path).join(', ')}`)
