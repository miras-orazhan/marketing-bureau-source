'use client'

import { Calendar, Clock, User, Eye, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ArticleListItem } from '@/lib/articles'
import type { SiteSettingsPublic } from '@/lib/settings'

type ArticleCardProps = {
  article: ArticleListItem
  settings: SiteSettingsPublic
  onOpen: (slug: string) => void
  variant?: 'default' | 'featured' | 'compact'
}

export function ArticleCard({ article, settings, onOpen, variant = 'default' }: ArticleCardProps) {
  const formatDate = (d: Date) => {
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

  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={() => onOpen(article.slug)}
        className="group flex gap-3 text-left w-full hover:bg-muted/40 p-2 rounded-md transition-colors"
      >
        {article.coverImage && (
           
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-16 w-16 rounded object-cover shrink-0"
           loading="lazy" decoding="async" fetchPriority="auto" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground mb-1">
            {formatDate(article.publishedAt || article.createdAt)}
          </p>
          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h4>
        </div>
      </button>
    )
  }

  return (
    <article
      className={isFeatured ? 'group' : 'group bg-card rounded-lg border overflow-hidden hover:shadow-md transition-shadow'}
    >
      {isFeatured ? (
        <button
          type="button"
          onClick={() => onOpen(article.slug)}
          className="block text-left w-full"
        >
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {article.coverImage ? (
              <div className="aspect-[16/10] overflow-hidden rounded-lg">
                { }
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 loading="lazy" decoding="async" fetchPriority="auto" />
              </div>
            ) : (
              <div
                className="aspect-[16/10] rounded-lg flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}
              >
                <span className="text-4xl font-bold opacity-50">{settings.siteName[0] || 'A'}</span>
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  style={{
                    backgroundColor: settings.accentColor,
                    color: 'white',
                  }}
                >
                  {article.type === 'NEWS' ? 'Новость' : 'Статья'}
                </Badge>
                {article.featured && (
                  <Badge variant="outline">Выбор редакции</Badge>
                )}
                {article.tags?.slice(0, 2).map((t) => (
                  <Badge key={t} variant="secondary">#{t}</Badge>
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-muted-foreground leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {article.author && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" /> {article.author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {formatDate(article.publishedAt || article.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {article.viewCount}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Читать полностью <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onOpen(article.slug)}
          className="block text-left w-full h-full"
        >
          {article.coverImage ? (
            <div className="aspect-[16/10] overflow-hidden">
              { }
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               loading="lazy" decoding="async" fetchPriority="auto" />
            </div>
          ) : (
            <div
              className="aspect-[16/10] flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}
            >
              <span className="text-3xl font-bold opacity-50">{settings.siteName[0] || 'A'}</span>
            </div>
          )}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                style={{
                  borderColor: settings.accentColor,
                  color: settings.accentColor,
                }}
              >
                {article.type === 'NEWS' ? 'Новость' : 'Статья'}
              </Badge>
              {article.tags?.slice(0, 2).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">#{t}</Badge>
              ))}
            </div>
            <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {formatDate(article.publishedAt || article.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {article.viewCount}
              </span>
            </div>
          </div>
        </button>
      )}
    </article>
  )
}
