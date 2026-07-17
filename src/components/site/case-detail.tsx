'use client'

import { ArrowLeft, Calendar, TrendingUp, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CasePublic } from '@/lib/company-content'
import type { SiteSettingsPublic } from '@/lib/settings'
import { CtaSection } from './home-sections/cta-section'

type CaseDetailProps = {
  caseItem: CasePublic
  settings: SiteSettingsPublic
  related: CasePublic[]
  onBack: () => void
  onOpen: (slug: string) => void
}

export function CaseDetail({
  caseItem,
  settings,
  related,
  onBack,
  onOpen,
}: CaseDetailProps) {
  const formatDate = (d: Date | string) => {
    try {
      return new Date(d).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return ''
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: caseItem.title, url: shareUrl })
      } catch {
        // ignore
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('Ссылка скопирована в буфер обмена')
      } catch {
        // ignore
      }
    }
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Все кейсы
      </Button>

      {/* Заголовок */}
      <header className="space-y-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {caseItem.client && (
            <Badge
              style={{
                backgroundColor: settings.accentColor,
                color: 'white',
              }}
            >
              {caseItem.client}
            </Badge>
          )}
          {caseItem.tags && caseItem.tags.length > 0 &&
            caseItem.tags.map((t) => (
              <Badge key={t} variant="secondary">#{t}</Badge>
            ))
          }
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: settings.primaryColor }}>
          {caseItem.title}
        </h1>
        {caseItem.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {caseItem.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground border-t pt-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(caseItem.createdAt)}
          </span>
          {caseItem.results && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${settings.accentColor}1a`,
                color: settings.accentColor,
              }}
            >
              <TrendingUp className="h-3 w-3" />
              {caseItem.results}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onShare} className="ml-auto">
            <Share2 className="h-4 w-4 mr-1" /> Поделиться
          </Button>
        </div>
      </header>

      {/* Обложка */}
      {caseItem.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
          <img
            src={caseItem.coverImage}
            alt={caseItem.title}
            className="w-full h-full object-cover"
           loading="lazy" decoding="async" fetchPriority="auto" />
        </div>
      ) : (
        <div
          className="aspect-[16/9] rounded-lg mb-8 flex items-center justify-center text-white"
          style={{
            background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
          }}
        >
          <span className="text-7xl font-bold opacity-50">
            {(caseItem.client || caseItem.title)[0]?.toUpperCase() || 'M'}
          </span>
        </div>
      )}

      {/* Контент */}
      {caseItem.content ? (
        <div
          className="article-content prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: caseItem.content }}
        />
      ) : (
        <p className="text-muted-foreground">Описание кейса скоро появится.</p>
      )}

      {/* CTA-баннер — переиспользуемый компонент (как на главной, услугах, FAQ, кейсах) */}
      <div className="mt-12">
        <CtaSection settings={settings} source="case-cta" />
      </div>

      {/* Похожие кейсы */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-semibold mb-4" style={{ color: settings.primaryColor }}>
            Другие кейсы
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onOpen(r.slug)}
                className="group text-left bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
              >
                {r.coverImage ? (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={r.coverImage}
                      alt={r.title}
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
                    <span className="text-3xl font-bold opacity-50">
                      {(r.client || r.title)[0]?.toUpperCase() || 'M'}
                    </span>
                  </div>
                )}
                <div className="p-4">
                  {r.client && (
                    <p className="text-xs text-muted-foreground mb-1">{r.client}</p>
                  )}
                  <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {r.title}
                  </h3>
                  {r.results && (
                    <p className="text-xs mt-2 font-semibold" style={{ color: settings.accentColor }}>
                      <TrendingUp className="inline h-3 w-3 mr-1" />
                      {r.results}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
