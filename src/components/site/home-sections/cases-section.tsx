'use client'

import { ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CasePublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { SectionHeader } from './section-header'

type CasesSectionProps = {
  settings: SiteSettingsPublic
  items: CasePublic[]
  onSeeAll: () => void
  /** Открыть детальную страницу кейса по slug */
  onOpenCase: (slug: string) => void
}

export function CasesSection({ settings, items, onSeeAll, onOpenCase }: CasesSectionProps) {
  return (
    <section id="cases" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <SectionHeader
          label="Наш опыт"
          title={settings.casesSectionTitle}
          text={settings.casesSectionText}
          primaryColor={settings.primaryColor}
          accentColor={settings.accentColor}
        />
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Кейсы скоро появятся.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.slice(0, 6).map((item) => (
              <article
                key={item.id}
                onClick={() => onOpenCase(item.slug)}
                className="group bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
              >
                {item.coverImage ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    { }
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     loading="lazy" decoding="async" fetchPriority="auto" />
                  </div>
                ) : (
                  <div
                    className="aspect-[16/10] flex items-center justify-center text-white"
                    style={{
                      background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
                    }}
                  >
                    <span className="text-4xl font-bold opacity-50">
                      {(item.client || item.title)[0]?.toUpperCase() || 'M'}
                    </span>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  {item.client && (
                    <p className="text-xs text-muted-foreground mb-1">{item.client}</p>
                  )}
                  <h3
                    className="font-semibold mb-2 leading-tight"
                    style={{ color: settings.primaryColor }}
                  >
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3 flex-1">
                      {item.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    {item.results ? (
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${settings.accentColor}1a`,
                          color: settings.accentColor,
                        }}
                      >
                        <TrendingUp className="h-3 w-3" />
                        {item.results}
                      </div>
                    ) : (
                      <span />
                    )}
                    <span
                      className="inline-flex items-center text-xs font-medium opacity-70 group-hover:opacity-100 transition-opacity"
                      style={{ color: settings.accentColor }}
                    >
                      Подробнее
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </span>
                  </div>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={onSeeAll}>
              Все кейсы
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
