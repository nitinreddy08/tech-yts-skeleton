/**
 * lib/repositories/errors.ts
 *
 * A small, transport-agnostic error hierarchy that every repository throws.
 * The point is that callers (server actions, MSW handlers, route handlers) map
 * these to their own concern — an HTTP status, a form error map — without the
 * repository knowing anything about HTTP. When a real backend replaces the
 * in-memory store, it maps its own errors (Postgres `23505`, HTTP 409, …) onto
 * this same hierarchy and every caller keeps working.
 */

export type RepositoryErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'FOREIGN_KEY'

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode
  /** Field-level messages, shaped like Zod's `flatten().fieldErrors`. */
  readonly fieldErrors?: Record<string, string[]>

  constructor(
    code: RepositoryErrorCode,
    message: string,
    fieldErrors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'RepositoryError'
    this.code = code
    this.fieldErrors = fieldErrors
  }

  /** The HTTP status this error maps to when surfaced over the wire. */
  get httpStatus(): number {
    switch (this.code) {
      case 'NOT_FOUND':
        return 404
      case 'CONFLICT':
        return 409
      case 'VALIDATION':
      case 'FOREIGN_KEY':
        return 400
    }
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entity: string, key?: string) {
    super('NOT_FOUND', key ? `${entity} not found: ${key}` : `${entity} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends RepositoryError {
  constructor(message: string) {
    super('CONFLICT', message)
    this.name = 'ConflictError'
  }
}

export class ValidationError extends RepositoryError {
  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super('VALIDATION', message, fieldErrors)
    this.name = 'ValidationError'
  }
}

export class ForeignKeyError extends RepositoryError {
  constructor(message: string) {
    super('FOREIGN_KEY', message)
    this.name = 'ForeignKeyError'
  }
}

export function isRepositoryError(e: unknown): e is RepositoryError {
  return e instanceof RepositoryError
}
