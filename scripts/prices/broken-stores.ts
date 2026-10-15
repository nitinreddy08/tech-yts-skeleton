/** Prints the store keys whose last run was "broken", one per line (used by the CI repair step). */
import { join, resolve } from 'node:path'
import { loadHealth } from '@/lib/prices/load'

const health = loadHealth(join(resolve(__dirname, '..', '..'), 'data', 'price-health.json'))
for (const [store, h] of Object.entries(health.stores)) if (h.status === 'broken') console.log(store)
