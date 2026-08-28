/**
 * Thin wrapper around Next.js revalidateTag.
 * Next.js 16 changed the signature to require a second `profile` argument.
 * This helper provides a consistent one-argument call site.
 */
import { revalidateTag as _revalidateTag } from 'next/cache'

export function revalidateTag(tag: string) {
  // 'max' = the "max" cache profile (keeps existing semantics from the original code)
  _revalidateTag(tag, 'max')
}
