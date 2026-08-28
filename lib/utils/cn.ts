/** Joins class-name fragments, dropping falsy values — no dependency needed for this app's scale. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
