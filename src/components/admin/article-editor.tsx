'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Loader2, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { RichTextEditor } from '@/components/rich-text-editor'
import {
  apiCreateArticle,
  apiUpdateArticle,
  apiDeleteArticle,
  apiGetArticle,
} from '@/lib/api-client'
import { toast } from 'sonner'
import type { ArticleFull } from '@/lib/articles'

type ArticleEditorProps = {
  type: 'ARTICLE' | 'NEWS'
  articleId?: string // если задан — редактирование, иначе создание
  onBack: () => void
}

export function ArticleEditor({ type, articleId, onBack }: ArticleEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(!!articleId)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [author, setAuthor] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [published, setPublished] = useState(false)
  const [featured, setFeatured] = useState(false)

  // Загрузка статьи (если редактируем)
  useEffect(() => {
    if (!articleId) {
      setLoading(false)
      return
    }
    setLoading(true)
    apiGetArticle(articleId)
      .then((a) => {
        if (!a) {
          toast.error('Материал не найден')
          onBack()
          return
        }
        setTitle(a.title)
        setSlug(a.slug)
        setExcerpt(a.excerpt || '')
        setContent(a.content)
        setCoverImage(a.coverImage || '')
        setAuthor(a.author || '')
        setTags(a.tags || [])
        setPublished(a.published)
        setFeatured(a.featured)
      })
      .catch((e) => toast.error(e?.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [articleId, onBack])

  const handleAddTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Ошибка загрузки')
        return
      }
      const data = await res.json()
      setCoverImage(data.url)
      toast.success('Обложка загружена')
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка')
    } finally {
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Введите заголовок')
      return
    }
    if (!content.trim() || content === '<p></p>') {
      toast.error('Введите содержимое')
      return
    }

    setSaving(true)
    try {
      const payload = {
        type,
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        coverImage: coverImage.trim() || undefined,
        author: author.trim() || undefined,
        tags,
        published,
        featured,
      }

      if (articleId) {
        const result = await apiUpdateArticle(articleId, payload)
        if (result.ok) {
          toast.success('Сохранено')
          fetch('/').catch(() => {})
        } else {
          toast.error(result.error || 'Ошибка сохранения')
        }
      } else {
        const result = await apiCreateArticle(payload)
        if (result.ok && result.id) {
          toast.success('Создано')
          fetch('/').catch(() => {})
          onBack()
        } else {
          toast.error(result.error || 'Ошибка создания')
        }
      }
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!articleId) return
    setDeleting(true)
    try {
      const result = await apiDeleteArticle(articleId)
      if (result.ok) {
        toast.success('Удалено')
        fetch('/').catch(() => {})
        onBack()
      } else {
        toast.error(result.error || 'Ошибка удаления')
      }
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Загрузка...
      </div>
    )
  }

  const typeLabel = type === 'NEWS' ? 'новости' : 'статьи'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {articleId ? `Редактирование ${typeLabel}` : `Новая ${typeLabel}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {articleId ? `ID: ${articleId}` : 'Заполните поля и сохраните'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {articleId && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Удалить
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Сохранение...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" /> Сохранить
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка — основной контент */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок..."
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Краткое описание (excerpt)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Короткое описание для карточки и SEO..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Используется в списках и как meta description.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Содержимое *</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Напишите текст. Используйте тулбар для форматирования..."
            />
          </div>
        </div>

        {/* Правая колонка — настройки */}
        <div className="space-y-4">
          {/* Статус */}
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">Статус публикации</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="published" className="cursor-pointer">
                Опубликовано
              </Label>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="featured" className="cursor-pointer flex items-center gap-1">
                <Star className="h-3 w-3" />
                Рекомендуемое
              </Label>
              <Switch
                id="featured"
                checked={featured}
                onCheckedChange={setFeatured}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {published
                ? 'Виден на сайте.'
                : 'Сохранён как черновик — не виден на сайте.'}
            </p>
          </div>

          {/* Обложка */}
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">Обложка</h3>
            {coverImage ? (
              <div className="relative group">
                { }
                <img
                  src={coverImage}
                  alt="Обложка"
                  className="w-full aspect-video object-cover rounded-md border"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-90"
                  onClick={() => setCoverImage('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">
                Нет обложки
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  Загрузить
                </label>
              </Button>
            </div>
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="или вставьте URL"
              className="text-xs"
            />
          </div>

          {/* Автор */}
          <div className="bg-card border rounded-lg p-4 space-y-2">
            <Label htmlFor="author">Автор</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Имя автора"
            />
          </div>

          {/* Slug */}
          <div className="bg-card border rounded-lg p-4 space-y-2">
            <Label htmlFor="slug">URL (slug)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-from-title"
            />
            <p className="text-xs text-muted-foreground">
              Оставьте пустым — сгенерируется из заголовка.
            </p>
          </div>

          {/* Теги */}
          <div className="bg-card border rounded-lg p-4 space-y-2">
            <Label>Теги</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="тег"
              />
              <Button type="button" size="icon" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {tags.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                  >
                    #{t} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Диалог подтверждения удаления */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить материал?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Материал «{title}» будет удалён безвозвратно.
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
