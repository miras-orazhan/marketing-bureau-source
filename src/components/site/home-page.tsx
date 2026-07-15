'use client'

import { Newspaper, FileText, TrendingUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ArticleListItem } from '@/lib/articles'
import type { SiteSettingsPublic } from '@/lib/settings'
import { ArticleCard } from './article-card'

type HomePageProps = {
  settings: SiteSettingsPublic
  featured: ArticleListItem | null
  latestArticles: ArticleListItem[]
  latestNews: ArticleListItem[]
  onOpenArticle: (slug: string) => void
  onBrowseAll: (type: 'ARTICLE' | 'NEWS') => void
}

export function HomePage({
  settings,
  featured,
  latestArticles,
  latestNews,
  onOpenArticle,
  onBrowseAll,
}: HomePageProps) {
  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  return (
    <div className="space-y-12 pb-12">
      {/* Hero уже рендерится отдельно */}

      {/* Featured статья */}
      {featured && (
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5" style={{ color: settings.accentColor }} />
            <h2 className="text-xl font-semibold">Главный материал</h2>
          </div>
          <ArticleCard
            article={featured}
            settings={settings}
            onOpen={onOpenArticle}
            variant="featured"
          />
        </section>
      )}

      {/* Последние статьи */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" style={{ color: settings.accentColor }} />
            <h2 className="text-xl font-semibold">Последние статьи</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onBrowseAll('ARTICLE')}>
            Все статьи <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {latestArticles.length === 0 ? (
          <p className="text-muted-foreground text-center py-12 border rounded-lg border-dashed">
            Пока нет опубликованных статей.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.slice(0, 6).map((a) => (
              <ArticleCard
                key={a.id}
                article={a}
                settings={settings}
                onOpen={onOpenArticle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Последние новости — двухколоночный layout */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" style={{ color: settings.accentColor }} />
            <h2 className="text-xl font-semibold">Последние новости</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onBrowseAll('NEWS')}>
            Все новости <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {latestNews.length === 0 ? (
          <p className="text-muted-foreground text-center py-12 border rounded-lg border-dashed">
            Пока нет опубликованных новостей.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {latestNews.slice(0, 8).map((n) => (
              <div
                key={n.id}
                className="flex gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onOpenArticle(n.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onOpenArticle(n.slug)
                }}
              >
                {n.coverImage ? (
                   
                  <img
                    src={n.coverImage}
                    alt={n.title}
                    className="h-20 w-20 rounded object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="h-20 w-20 rounded flex items-center justify-center text-white shrink-0"
                    style={{ background: settings.accentColor }}
                  >
                    <Newspaper className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">
                    {formatDate(n.publishedAt || n.createdAt)}
                  </p>
                  <h3 className="font-medium leading-tight line-clamp-2">
                    {n.title}
                  </h3>
                  {n.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {n.excerpt}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* О нас (если есть aboutText) */}
      {settings.aboutText && (
        <section className="container mx-auto px-4">
          <div
            className="rounded-2xl p-8 md:p-12 text-white"
            style={{
              background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`,
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">О нашем портале</h2>
            {settings.aboutText && (
              <div
                className="article-content prose prose-sm max-w-3xl text-white/90 leading-relaxed [&_a]:text-white [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: settings.aboutText }}
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}
