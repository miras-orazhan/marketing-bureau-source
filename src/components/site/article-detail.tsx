'use client'

import { ArrowLeft, Calendar, Clock, User, Eye, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ArticleFull } from '@/lib/articles'
import type { SiteSettingsPublic } from '@/lib/settings'

type ArticleDetailProps = {
  article: ArticleFull
  settings: SiteSettingsPublic
  related: ArticleFull[] | import('@/lib/articles').ArticleListItem[]
  onBack: () => void
  onOpen: (slug: string) => void
}

export function ArticleDetail({ article, settings, related, onBack, onOpen }: ArticleDetailProps) {
  const formatDate = (d: Date) => {
    try {
      return new Date(d).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: shareUrl })
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
        Назад
      </Button>

      {/* Заголовок */}
      <header className="space-y-4 mb-8">
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
          {article.tags?.map((t) => (
            <Badge key={t} variant="secondary">#{t}</Badge>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground border-t pt-4">
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" /> {article.author}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {formatDate(article.publishedAt || article.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {article.viewCount} просмотров
          </span>
          <Button variant="ghost" size="sm" onClick={onShare} className="ml-auto">
            <Share2 className="h-4 w-4 mr-1" /> Поделиться
          </Button>
        </div>
      </header>

      {/* Обложка */}
      {article.coverImage && (
        <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
          { }
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
           loading="lazy" decoding="async" fetchPriority="auto" />
        </div>
      )}

      {/* Контент */}
      <div
        className="article-content prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Похожие материалы */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Похожие материалы</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.slice(0, 3).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onOpen(r.slug)}
                className="group text-left bg-card rounded-lg border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {r.type === 'NEWS' ? 'Новость' : 'Статья'}
                  </Badge>
                </div>
                <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {r.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(r.publishedAt || r.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
