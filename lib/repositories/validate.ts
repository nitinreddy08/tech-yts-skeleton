/**
 * lib/repositories/validate.ts
 *
 * Bridges Zod validation into the repository error hierarchy. Repositories call
 * `parseOrThrow(schema, input)` at every write boundary so a bad payload fails
 * the same way regardless of who called (HTTP handler, server action, test).
 */
import type { z } from 'zod'
import { ValidationError } from './errors'

export function parseOrThrow<T extends z.ZodType>(
  schema: T,
  input: unknown,
  message = 'Validation failed'
): z.infer<T> {
  const result = schema.safeParse(input)
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>
    throw new ValidationError(message, fieldErrors)
  }
  return result.data
}
