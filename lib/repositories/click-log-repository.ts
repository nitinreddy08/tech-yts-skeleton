/**
 * lib/repositories/click-log-repository.ts
 *
 * Repository interface for the append-only affiliate ClickLog (Requirement 4).
 * `record` is the only write — a click is a fact, not an editable resource —
 * and the redirect handler is expected to call it fire-and-forget (don't await
 * before redirecting; see Requirement 4.6) rather than block the response on
 * the write.
 */
import type { ClickLog } from '@/lib/schemas'

export interface ClickLogQuery {
  productId?: string
  /** Only logs at or after this instant. */
  since?: Date
}

export interface ClickLogRepository {
  /** Accepts `unknown` deliberately — see the matching note on ProductRepository.create. */
  record(entry: unknown): Promise<ClickLog>
  list(query?: ClickLogQuery): Promise<ClickLog[]>
  /** click count per product_id, across all logged clicks. */
  countsByProduct(): Promise<Record<string, number>>
}
