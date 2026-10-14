'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

/**
 * Fade-in-on-scroll wrapper. It skips the animation entirely for people who
 * prefer reduced motion, and the `motion-section` class lets a <noscript>
 * rule (see app/layout.tsx) keep content visible when JavaScript is off —
 * the hidden starting state is rendered into the server HTML.
 */
export function MotionSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.section
      className={`motion-section ${className ?? ''}`}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      variants={fadeInUp}
      viewport={{ once: true }}
    >
      {children}
    </motion.section>
  )
}
