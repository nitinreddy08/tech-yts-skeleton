// Feature: ui-redesign, Property: animation variants
export const fadeInUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.06 } },
}
