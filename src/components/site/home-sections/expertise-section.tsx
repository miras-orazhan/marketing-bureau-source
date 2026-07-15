'use client'

import type { ExpertisePublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { DynamicIcon } from '@/components/site/dynamic-icon'
import { SectionHeader } from './section-header'

type ExpertiseSectionProps = {
  settings: SiteSettingsPublic
  items: ExpertisePublic[]
}

export function ExpertiseSection({ settings, items }: ExpertiseSectionProps) {
  return (
    <section id="expertise" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="Что мы умеем"
          title={settings.expertiseSectionTitle}
          text={settings.expertiseSectionText}
          primaryColor={settings.primaryColor}
          accentColor={settings.accentColor}
        />
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Скоро здесь появится наша экспертиза.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group p-4 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden bg-transparent"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <DynamicIcon
                      name={item.icon}
                      image={item.iconImage}
                      className="h-7 w-7"
                      // Lucide-иконка рисуется цветом accentColor (фирменный);
                      // для загруженного изображения фон и так не нужен.
                      iconStyle={{ color: settings.accentColor }}
                      imgClassName="h-12 w-12 object-contain"
                      alt={item.title}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold mb-1" style={{ color: settings.primaryColor }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <div
                        className="article-content prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: item.description }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
