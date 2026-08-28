// Feature: ui-redesign, Property 11: Navbar scroll border toggle

/**
 * Property 11: Navbar scroll border toggle
 * Validates: Requirements 2.3
 */
import { describe, it, expect, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import Navbar from '../Navbar'

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => '/' }))
vi.mock('@/components/ui/SearchBar', () => ({ SearchBar: () => <input placeholder="search" /> }))

describe('Navbar – Property 11: scroll border toggle', () => {
  /**
   * Property 11a: border-transparent when not scrolled
   */
  it('Property 11a: header has border-transparent in initial (unscrolled) state', () => {
    const { container } = render(<Navbar />)
    const header = container.querySelector('header')!
    expect(header.className).toContain('border-transparent')
    expect(header.className).not.toContain('border-border')
  })

  /**
   * Property 11b: border-border after scroll event
   */
  it('Property 11b: header gets border-border after scroll event', async () => {
    const { container } = render(<Navbar />)
    const header = container.querySelector('header')!

    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true })
      window.dispatchEvent(new Event('scroll'))
    })

    expect(header.className).toContain('border-border')
    expect(header.className).not.toContain('border-transparent')
  })

  /**
   * Property 11c: site_name from config is rendered
   */
  it('Property 11c: renders site_name from config', () => {
    const { container } = render(<Navbar />)
    expect(container.textContent).toContain('TechReviews India')
  })

  /**
   * Property 11d: mobile menu button has minimum 44x44 touch target (w-11 h-11)
   */
  it('Property 11d: mobile menu button has w-11 and h-11 classes for 44px touch target', () => {
    const { container } = render(<Navbar />)
    const menuButton = container.querySelector('button[aria-label="Open menu"]')!
    expect(menuButton.className).toContain('w-11')
    expect(menuButton.className).toContain('h-11')
  })
})
