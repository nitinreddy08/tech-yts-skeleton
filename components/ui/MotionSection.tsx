'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export function MotionSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      variants={fadeInUp}
      viewport={{ once: true }}
    >
      {children}
    </motion.section>
  )
}
