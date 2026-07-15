'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ServicePublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { DynamicIcon } from '@/components/site/dynamic-icon'
import { SectionHeader } from './section-header'

type ServicesSectionProps = {
  settings: SiteSettingsPublic
  items: ServicePublic[]
  onSeeAll: () => void
}

export function ServicesSection({ settings, items, onSeeAll }: ServicesSectionProps) {
  return (
    <section id="services" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="Что мы делаем"
          title={settings.servicesSectionTitle}
          text={settings.servicesSectionText}
          primaryColor={settings.primaryColor}
          accentColor={settings.accentColor}
        />
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Услуги скоро появятся.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-card border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center mb-4 overflow-hidden"
                  style={{ backgroundColor: `${settings.accentColor}1a` }}
                >
                  <DynamicIcon
                    name={item.icon}
                    image={item.iconImage}
                    className="h-6 w-6"
                    imgClassName="h-12 w-12 object-cover"
                    alt={item.title}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: settings.primaryColor }}>
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {item.excerpt}
                  </p>
                )}
                <button
                  type="button"
                  onClick={onSeeAll}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors group/btn"
                  style={{ color: settings.accentColor }}
                >
                  Подробнее
                  <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={onSeeAll}>
              Все услуги
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
