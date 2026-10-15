'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// An `autoFocus` field inside the dialog takes focus during React's commit,
// before the effect below runs, so "the focused element when the effect runs"
// would be the field itself. Remember the element that *lost* focus instead.
let lastBlurred: HTMLElement | null = null
if (typeof document !== 'undefined') {
  document.addEventListener(
    'focusin',
    (e) => {
      if (e.relatedTarget instanceof HTMLElement) lastBlurred = e.relatedTarget
    },
    true
  )
}

/**
 * Minimal modal behaviour for drawers / lightboxes / quick-view panels:
 * moves focus inside on open, traps Tab, closes on Escape, locks body scroll
 * and restores focus to the opener on close.
 *
 * Attach the returned ref to the dialog panel (the element that should
 * receive `role="dialog"` and `aria-modal`). Give it `tabIndex={-1}` so it can
 * take focus when it contains nothing focusable.
 */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const panel = ref.current
    const active = document.activeElement as HTMLElement | null
    const opener = panel?.contains(active) ? lastBlurred : active
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null) : []

    // Defer so the panel is painted (and any enter animation has started).
    const raf = requestAnimationFrame(() => (focusables()[0] ?? panel)?.focus())

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) {
        e.preventDefault()
        panel?.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panel?.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !panel?.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      opener?.focus?.()
    }
  }, [open])

  return ref
}
