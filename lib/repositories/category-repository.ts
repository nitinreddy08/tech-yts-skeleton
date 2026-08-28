/**
 * lib/repositories/category-repository.ts
 *
 * Read-only — there's no admin UI for authoring categories (they're seeded
 * fixtures defining each vertical's spec template), so unlike Product/Deal
 * there's no create/update here to design around.
 */
import type { Category } from '@/lib/schemas'

export interface CategoryRepository {
  /** Sorted by display_order. */
  list(): Promise<Category[]>
  findBySlug(slug: string): Promise<Category | null>
  findById(id: string): Promise<Category | null>
}
