'use client'

import { ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CasePublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { CtaSection } from './home-sections/cta-section'

type CasesPageProps = {
  settings: SiteSettingsPublic
  items: CasePublic[]
  onContact: () => void
  /** Открыть детальную страницу кейса по slug */
  onOpenCase: (slug: string) => void
}

export function CasesPage({ settings, items, onContact, onOpenCase }: CasesPageProps) {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <header className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: settings.primaryColor }}>
          {settings.casesSectionTitle}
        </h1>
        {settings.casesSectionText && (
          <div
            className="article-content prose prose-sm max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: settings.casesSectionText }}
          />
        )}
      </header>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-16 border border-dashed rounded-lg">
          Кейсы скоро появятся.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
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
                  <span className="text-5xl font-bold opacity-50">
                    {(item.client || item.title)[0]?.toUpperCase() || 'M'}
                  </span>
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                {item.client && (
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    {item.client}
                  </p>
                )}
                <h2 className="font-semibold text-lg mb-2" style={{ color: settings.primaryColor }}>
                  {item.title}
                </h2>
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
                    {item.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* CTA-баннер */}
      <CtaSection settings={settings} source="cases-cta" />
    </div>
  )
}
