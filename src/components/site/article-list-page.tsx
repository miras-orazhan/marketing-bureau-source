'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ArticleListItem } from '@/lib/articles'
import type { SiteSettingsPublic } from '@/lib/settings'
import { ArticleCard } from './article-card'

type ArticleListPageProps = {
  title: string
  description: string
  items: ArticleListItem[]
  settings: SiteSettingsPublic
  onOpenArticle: (slug: string) => void
  type: 'ARTICLE' | 'NEWS'
}

export function ArticleListPage({
  title,
  description,
  items,
  settings,
  onOpenArticle,
  type,
}: ArticleListPageProps) {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Все теги
  const allTags = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => i.tags?.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      if (selectedTag && !(i.tags || []).includes(selectedTag)) return false
      if (!q) return true
      return (
        i.title.toLowerCase().includes(q) ||
        (i.excerpt || '').toLowerCase().includes(q) ||
        (i.tags || []).some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [items, query, selectedTag])

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: settings.primaryColor }}>
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </header>

      {/* Поиск и фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по заголовку, описанию, тегам..."
            className="pl-9"
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedTag === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTag(null)}
          >
            Все
          </Button>
          {allTags.map((t) => (
            <Button
              key={t}
              variant={selectedTag === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(selectedTag === t ? null : t)}
            >
              #{t}
            </Button>
          ))}
        </div>
      )}

      {/* Результаты */}
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-16 border rounded-lg border-dashed">
          {items.length === 0
            ? `Пока нет опубликованных ${type === 'NEWS' ? 'новостей' : 'статей'}.`
            : 'Ничего не найдено по вашему запросу.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              settings={settings}
              onOpen={onOpenArticle}
            />
          ))}
        </div>
      )}

      <div className="mt-8 text-sm text-muted-foreground text-center">
        Найдено: {filtered.length} из {items.length}
      </div>
    </div>
  )
}
