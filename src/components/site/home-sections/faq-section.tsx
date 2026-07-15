'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { FaqPublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { SectionHeader } from './section-header'

type FaqSectionProps = {
  settings: SiteSettingsPublic
  items: FaqPublic[]
}

export function FaqSection({ settings, items }: FaqSectionProps) {
  return (
    <section id="faq" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionHeader
          label="Вопросы и ответы"
          title={settings.faqSectionTitle}
          text={settings.faqSectionText}
          primaryColor={settings.primaryColor}
          accentColor={settings.accentColor}
        />
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Вопросы скоро появятся.
          </p>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {items.map((item, idx) => (
              <AccordionItem
                key={item.id}
                value={`item-${idx}`}
                className="border rounded-lg px-5"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  )
}
