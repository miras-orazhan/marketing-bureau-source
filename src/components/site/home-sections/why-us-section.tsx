'use client'

import type { WhyUsPublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { DynamicIcon } from '@/components/site/dynamic-icon'
import { SectionHeader } from './section-header'

type WhyUsSectionProps = {
  settings: SiteSettingsPublic
  items: WhyUsPublic[]
}

export function WhyUsSection({ settings, items }: WhyUsSectionProps) {
  return (
    <section id="why-us" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="Почему мы"
          title={settings.whyUsSectionTitle}
          text={settings.whyUsSectionText}
          primaryColor={settings.primaryColor}
          accentColor={settings.accentColor}
        />
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Преимущества скоро появятся.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.map((item, idx) => (
              <div key={item.id} className="text-center space-y-3 p-4">
                <div
                  className="mx-auto h-16 w-16 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: settings.accentColor,
                    color: '#fff',
                  }}
                >
                  <DynamicIcon name={item.icon} className="h-7 w-7" />
                </div>
                <div
                  className="text-4xl font-bold opacity-30"
                  style={{ color: settings.accentColor }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-semibold" style={{ color: settings.primaryColor }}>
                  {item.title}
                </h3>
                {item.description && (
                  <div
                    className="article-content prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
