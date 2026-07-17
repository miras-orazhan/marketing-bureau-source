'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { FaqPublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { CtaSection } from './home-sections/cta-section'
import { Breadcrumbs as SiteBreadcrumbs } from './breadcrumbs'

type FaqPageProps = {
  settings: SiteSettingsPublic
  items: FaqPublic[]
  onContact: () => void
}

export function FaqPage({ settings, items, onContact }: FaqPageProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      {/* Хлебные крошки */}
      <div className="mb-6">
        <SiteBreadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'FAQ' },
          ]}
          accentColor={settings.accentColor}
        />
      </div>

      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: settings.primaryColor }}>
          {settings.faqSectionTitle}
        </h1>
        {settings.faqSectionText && (
          <div
            className="article-content prose prose-sm max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: settings.faqSectionText }}
          />
        )}
      </header>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 border border-dashed rounded-lg bg-white">
          Вопросы скоро появятся.
        </p>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {items.map((item, idx) => (
            <AccordionItem
              key={item.id}
              value={`item-${idx}`}
              className="border rounded-lg px-5 bg-white shadow-sm hover:shadow-md transition-shadow"
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

      {/* CTA-баннер */}
      <CtaSection settings={settings} source="faq-cta" />
    </div>
  )
}
