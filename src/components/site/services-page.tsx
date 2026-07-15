'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ServicePublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { DynamicIcon } from '@/components/site/dynamic-icon'
import { CtaSection } from './home-sections/cta-section'

type ServicesPageProps = {
  settings: SiteSettingsPublic
  items: ServicePublic[]
  onContact: () => void
}

export function ServicesPage({ settings, items, onContact }: ServicesPageProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <header className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: settings.primaryColor }}>
          {settings.servicesSectionTitle}
        </h1>
        {settings.servicesSectionText && (
          <div
            className="article-content prose prose-sm max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: settings.servicesSectionText }}
          />
        )}
      </header>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 border border-dashed rounded-lg">
          Услуги скоро появятся.
        </p>
      ) : (
        <div className="space-y-6">
          {items.map((item, idx) => (
            <article
              key={item.id}
              className="bg-card border rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-1 space-y-3">
                <div
                  className="h-14 w-14 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: `${settings.accentColor}1a` }}
                >
                  <DynamicIcon
                    name={item.icon}
                    image={item.iconImage}
                    className="h-7 w-7"
                    imgClassName="h-14 w-14 object-cover"
                    alt={item.title}
                  />
                </div>
                <h2 className="text-xl font-bold" style={{ color: settings.primaryColor }}>
                  {item.title}
                </h2>
                {item.excerpt && (
                  <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                )}
              </div>
              <div className="md:col-span-2">
                {item.content ? (
                  <div
                    className="article-content prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Подробное описание услуги скоро появится.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CTA-баннер */}
      <CtaSection settings={settings} source="services-cta" />
    </div>
  )
}
