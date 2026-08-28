'use client'

import { cn } from '@/lib/utils/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

/** Switch control per design-system/components.md "Toggle". No existing
 *  ad-hoc toggle in the app to migrate yet — built ahead of use, ready for
 *  the next filter/settings switch that needs one. */
export function Toggle({ checked, onChange, disabled = false, className = '', 'aria-label': ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-8 shrink-0 items-center rounded-full transition-colors',
        disabled
          ? checked ? 'bg-neutral-400 cursor-not-allowed' : 'bg-neutral-200 cursor-not-allowed'
          : checked ? 'bg-primary-700 hover:bg-primary-800' : 'bg-neutral-300 hover:bg-neutral-400',
        className
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-150 ease-out',
          disabled ? 'bg-neutral-100' : 'bg-white',
          checked ? 'translate-x-[14px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}
