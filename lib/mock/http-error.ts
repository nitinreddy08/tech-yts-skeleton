/**
 * lib/mock/http-error.ts
 *
 * Translates a RepositoryError thrown by a repository into the JSON error
 * shape + status code MSW handlers (and, later, real API routes) return. One
 * place decides that a ConflictError is a 409 with `{ error, code: '23505' }`
 * (mirroring Postgres's unique-violation code, which the admin UI already
 * expects) — so every handler's error path looks identical.
 */
import { HttpResponse } from 'msw'
import { isRepositoryError } from '@/lib/repositories'

export function repositoryErrorResponse(error: unknown): HttpResponse<Record<string, unknown>> {
  if (isRepositoryError(error)) {
    const body: { error: string; code?: string; fieldErrors?: Record<string, string[]> } = {
      error: error.message,
    }
    if (error.code === 'CONFLICT') body.code = '23505'
    if (error.fieldErrors) body.fieldErrors = error.fieldErrors
    return HttpResponse.json(body, { status: error.httpStatus })
  }
  throw error
}
