/**
 * lib/repositories/in-memory/click-log-repository.ts
 */
import { db, newId, type db as DbType } from '@/lib/mock/db'
import { clickLogInputSchema, type ClickLog } from '@/lib/schemas'
import { parseOrThrow } from '../validate'
import type { ClickLogRepository, ClickLogQuery } from '../click-log-repository'
import { clickCountsByProduct } from './mappers'

type Store = typeof DbType

export function createInMemoryClickLogRepository(store: Store = db): ClickLogRepository {
  return {
    async record(entry) {
      const data = parseOrThrow(clickLogInputSchema, entry, 'Invalid click log entry')
      const log: ClickLog = {
        id: newId(),
        affiliate_link_id: data.affiliate_link_id,
        product_id: data.product_id,
        store_name: data.store_name,
        clicked_at: new Date().toISOString(),
        user_agent: data.user_agent,
        referrer: data.referrer,
        ip_hash: data.ip_hash,
      }
      store.clickLogs.push(log)
      return log
    },

    async list(query: ClickLogQuery = {}) {
      let rows = [...store.clickLogs]
      if (query.productId) rows = rows.filter((c) => c.product_id === query.productId)
      if (query.since) rows = rows.filter((c) => new Date(c.clicked_at) >= query.since!)
      return rows.sort(
        (a, b) => new Date(b.clicked_at).getTime() - new Date(a.clicked_at).getTime()
      )
    },

    async countsByProduct() {
      return clickCountsByProduct(store)
    },
  }
}
