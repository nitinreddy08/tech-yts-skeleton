'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import type { FAQ } from '@/types'

interface FAQAccordionProps {
  faqs: FAQ[]
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  if (!faqs.length) return null

  return (
    <Accordion.Root
      type="single"
      collapsible
      className="divide-y divide-border rounded-(--radius-card) border border-border overflow-hidden"
    >
      {faqs.map((faq) => (
        <Accordion.Item key={faq.id} value={faq.id}>
          <Accordion.Trigger className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium text-primary hover:bg-surface-alt transition-colors group">
            <span>{faq.question}</span>
            <ChevronDown
              size={16}
              className="shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </Accordion.Trigger>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="px-4 pb-4 text-sm text-muted leading-relaxed">
              {faq.answer}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}
