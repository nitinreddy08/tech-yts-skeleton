'use client'

import { useEffect, useRef } from 'react'

/**
 * Bottom-layer registry.
 *
 * Several fixed bars share the bottom edge of the viewport (mobile tab bar,
 * compare tray, sticky buy bar, cookie banner). Hard-coded `bottom-16`
 * offsets break as soon as one of them is absent or wraps, so each layer
 * publishes its measured height as a CSS variable and the others stack on
 * top of it. See `--layer-*` in app/globals.css for the stacking order.
 */
export type BottomLayer = 'tabbar' | 'compare' | 'buy' | 'cookie'

/**
 * Attach the returned ref to a fixed bar. While `active` is true its rendered
 * height is published as `--layer-<name>`; otherwise (or on unmount) the var
 * falls back to 0px. Returns a ref callback-compatible object ref.
 */
export function useBottomLayer<T extends HTMLElement>(name: BottomLayer, active = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const prop = `--layer-${name}`
    const root = document.documentElement
    const el = ref.current
    if (!active || !el) {
      root.style.setProperty(prop, '0px')
      return
    }

    const publish = () => root.style.setProperty(prop, `${Math.round(el.getBoundingClientRect().height)}px`)
    publish()

    if (typeof ResizeObserver === 'undefined') return () => root.style.setProperty(prop, '0px')
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.setProperty(prop, '0px')
    }
  }, [name, active])

  return ref
}

/** Publishes the sticky site header's height as `--navbar-height`. */
export function useNavbarHeight<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const publish = () => root.style.setProperty('--navbar-height', `${Math.round(el.getBoundingClientRect().height)}px`)
    publish()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(publish)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return ref
}
