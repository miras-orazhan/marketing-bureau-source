'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Eye, EyeOff, Star, FileText, Newspaper, Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { apiListArticles, apiUpdateArticle, apiDeleteArticle } from '@/lib/api-client'
import type { ArticleListItem } from '@/lib/articles'
import { ArticleEditor } from './article-editor'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

type ArticlesManagerProps = {
  type: 'ARTICLE' | 'NEWS'
}

export function ArticlesManager({ type }: ArticlesManagerProps) {
  const router = useRouter()
  const [items, setItems] = useState<ArticleListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    apiListArticles(type)
      .then(setItems)
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
     
  }, [type])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((i) => {
      if (statusFilter === 'published' && !i.published) return false
      if (statusFilter === 'draft' && i.published) return false
      if (!q) return true
      return i.title.toLowerCase().includes(q) || (i.slug || '').toLowerCase().includes(q)
    })
  }, [items, query, statusFilter])

  const togglePublished = async (id: string, current: boolean) => {
    // оптимистично
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, published: !current } : i)))
    try {
      const result = await apiUpdateArticle(id, { published: !current })
      if (!result.ok) {
        // откатываем
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, published: current } : i)))
        toast.error(result.error || 'Ошибка')
      } else {
        toast.success(!current ? 'Опубликовано' : 'Снято с публикации')
        // Тихо обновляем SSR-кэш главной
        fetch('/').catch(() => {})
      }
    } catch (e: any) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, published: current } : i)))
      toast.error(e?.message || 'Ошибка')
    }
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, featured: !current } : i)))
    try {
      const result = await apiUpdateArticle(id, { featured: !current })
      if (!result.ok) {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, featured: current } : i)))
        toast.error(result.error || 'Ошибка')
      } else {
        fetch('/').catch(() => {})
      }
    } catch (e: any) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, featured: current } : i)))
      toast.error(e?.message || 'Ошибка')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const result = await apiDeleteArticle(confirmDelete)
      if (result.ok) {
        toast.success('Удалено')
        setItems((prev) => prev.filter((i) => i.id !== confirmDelete))
        fetch('/').catch(() => {})
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  // Режим редактирования / создания
  if (creating) {
    return (
      <ArticleEditor
        type={type}
        onBack={() => {
          setCreating(false)
          load()
        }}
      />
    )
  }
  if (editingId) {
    return (
      <ArticleEditor
        type={type}
        articleId={editingId}
        onBack={() => {
          setEditingId(null)
          load()
        }}
      />
    )
  }

  const typeLabel = type === 'NEWS' ? 'Новости' : 'Статьи'
  const typeLabelSingular = type === 'NEWS' ? 'новость' : 'статью'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{typeLabel}</h1>
          <p className="text-sm text-muted-foreground">
            Всего: {items.length} · Опубликовано: {items.filter((i) => i.published).length}
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Создать {typeLabelSingular}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по заголовку или slug..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'published', 'draft'] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'Все' : s === 'published' ? 'Опубл.' : 'Черновики'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Загрузка...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            {items.length === 0
              ? `Пока нет ${typeLabel.toLowerCase()}. Создайте первую!`
              : 'Ничего не найдено.'}
          </p>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Создать {typeLabelSingular}
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Заголовок</TableHead>
                <TableHead>Просмотры</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-center">Реком.</TableHead>
                <TableHead className="text-center">Опубл.</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {a.coverImage ? (
                         
                        <img
                          src={a.coverImage}
                          alt=""
                          className="h-10 w-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                          {type === 'NEWS' ? (
                            <Newspaper className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setEditingId(a.id)}
                          className="font-medium hover:text-primary text-left line-clamp-1"
                          title={a.title}
                        >
                          {a.title}
                        </button>
                        <div className="flex items-center gap-1 flex-wrap mt-0.5">
                          <span className="text-xs text-muted-foreground">/{a.slug}</span>
                          {a.tags?.slice(0, 3).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px] h-4">
                              #{t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{a.viewCount}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(a.updatedAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={a.featured}
                        onCheckedChange={() => toggleFeatured(a.id, a.featured)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={a.published}
                        onCheckedChange={() => togglePublished(a.id, a.published)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingId(a.id)}
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setConfirmDelete(a.id)}
                        title="Удалить"
                      >
                        {/* Trash icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Подтверждение удаления */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить материал?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Это действие необратимо. Материал будет удалён навсегда.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={deleting}>Отмена</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
