'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Eye, EyeOff, Save, ArrowLeft, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/rich-text-editor'
import { Breadcrumbs } from './breadcrumbs'
import {
  apiListCases,
  apiCreateCase,
  apiUpdateCase,
  apiDeleteCase,
  apiGetSettings,
  apiUpdateSettings,
} from '@/lib/api-client'
import { toast } from 'sonner'

type Item = {
  id: string
  title: string
  slug: string
  client: string | null
  excerpt: string | null
  content: string | null
  coverImage: string | null
  results: string | null
  tags: string[] | null
  sortOrder: number
  published: boolean
  featured: boolean
  updatedAt: string
}

export function CasesManager() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Item | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionText, setSectionText] = useState('')
  const [sectionSaving, setSectionSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiListCases()
      .then(setItems)
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    apiGetSettings().then((s: any) => {
      setSectionTitle(s.casesSectionTitle || '')
      setSectionText(s.casesSectionText || '')
    }).catch(() => {})
    load()
  }, [])

  const handleSaveSection = async () => {
    setSectionSaving(true)
    try {
      const res = await apiUpdateSettings({
        casesSectionTitle: sectionTitle || null,
        casesSectionText: sectionText || null,
      } as any)
      if (res.ok) toast.success('Заголовок секции сохранён')
      else toast.error(res.error || 'Ошибка')
    } finally {
      setSectionSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await apiDeleteCase(confirmDelete)
      if (res.ok) {
        toast.success('Удалено')
        setItems((prev) => prev.filter((i) => i.id !== confirmDelete))
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  if (editing) {
    return (
      <CaseEditor
        item={editing}
        onBack={() => {
          setEditing(null)
          load()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Кейсы</h1>
          <p className="text-sm text-muted-foreground">
            Проекты и кейсы. Отображаются на главной и на странице «Кейсы».
          </p>
        </div>
        <Button onClick={() => setEditing({} as any)}>
          <Plus className="h-4 w-4 mr-1" /> Создать кейс
        </Button>
      </div>

      {/* Заголовок и описание секции (H2 + текст) */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Заголовок секции (H2)</Label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Например: Кейсы" />
          </div>
          <div className="space-y-2">
            <Label>Описание секции</Label>
            <RichTextEditor value={sectionText} onChange={setSectionText} placeholder="Краткое описание секции..." />
          </div>
          <Button onClick={handleSaveSection} disabled={sectionSaving} size="sm">
            {sectionSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Сохранить заголовок
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Кейсы</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Пока нет кейсов. Создайте первый!</p>
          <Button onClick={() => setEditing({} as any)}>
            <Plus className="h-4 w-4 mr-1" /> Создать кейс
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <div className="aspect-[16/10] mb-3 bg-muted rounded overflow-hidden">
                  {item.coverImage ? (
                     
                    <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="w-full text-left"
                >
                  {item.client && (
                    <div className="text-xs text-muted-foreground uppercase">{item.client}</div>
                  )}
                  <div className="font-medium truncate">{item.title}</div>
                  {item.results && (
                    <div className="text-xs text-emerald-600 mt-1">{item.results}</div>
                  )}
                </button>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={item.published}
                      onCheckedChange={async (v) => {
                        const res = await apiUpdateCase(item.id, { published: v })
                        if (res.ok) setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: v } : i)))
                      }}
                    />
                    {item.published ? (
                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive h-7 w-7 p-0"
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить кейс?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">Это действие необратимо.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={deleting}>Отмена</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CaseEditor({
  item,
  onBack,
}: {
  item: Item | null
  onBack: () => void
}) {
  const isNew = !item?.id
  const [title, setTitle] = useState(item?.title || '')
  const [slug, setSlug] = useState(item?.slug || '')
  const [client, setClient] = useState(item?.client || '')
  const [excerpt, setExcerpt] = useState(item?.excerpt || '')
  const [content, setContent] = useState(item?.content || '')
  const [coverImage, setCoverImage] = useState(item?.coverImage || '')
  const [results, setResults] = useState(item?.results || '')
  const [tags, setTags] = useState<string[]>(item?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [published, setPublished] = useState(item?.published ?? true)
  const [featured, setFeatured] = useState(item?.featured ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setTitle(item.title || '')
      setSlug(item.slug || '')
      setClient(item.client || '')
      setExcerpt(item.excerpt || '')
      setContent(item.content || '')
      setCoverImage(item.coverImage || '')
      setResults(item.results || '')
      setTags(item.tags || [])
      setPublished(item.published ?? true)
      setFeatured(item.featured ?? false)
    }
  }, [item])

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Ошибка')
        return
      }
      const data = await res.json()
      setCoverImage(data.url)
      toast.success('Загружено')
    } finally {
      e.target.value = ''
    }
  }

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Заголовок обязателен')
      return
    }
    // slug обязателен — это URL кейса (/cases/<slug>).
    // Если пустой — сгенерируем из title автоматически.
    const finalSlug = slug.trim() || slugifyFromTitle(title.trim())
    if (!finalSlug) {
      toast.error('Не удалось сформировать slug')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        slug: finalSlug,
        client: client.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        coverImage: coverImage.trim() === '' ? null : coverImage.trim(),
        results: results.trim() || undefined,
        tags,
        published,
        featured,
      }
      const res = isNew ? await apiCreateCase(payload) : await apiUpdateCase(item!.id, payload)
      if (res.ok) {
        toast.success(isNew ? 'Создано' : 'Сохранено')
        onBack()
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setSaving(false)
    }
  }

  /**
   * Простая транслитерация ru→lat + slugify.
   * Используется только если админ не ввёл slug вручную.
   * Админ может ввести свой (любой URL-safe) — он приоритетный.
   */
  function slugifyFromTitle(s: string): string {
    const ru: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh',
      з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts',
      ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
      я: 'ya',
    }
    return s
      .toLowerCase()
      .split('')
      .map((ch) => (ch in ru ? ru[ch] : ch))
      .join('')
      .replace(/[^a-z0-9\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Breadcrumbs
          items={[
            { label: 'Кейсы', onClick: onBack },
            { label: isNew ? 'Новый' : (item?.title || 'Редактирование') },
          ]}
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{isNew ? 'Новый кейс' : 'Редактирование кейса'}</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Сохранить
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок *</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">
              URL (slug) *
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                адрес страницы: /cases/&lt;slug&gt;
              </span>
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="например: tehno-altyn-lombard-network (латиницей, дефисы)"
              className="font-mono text-sm"
            />
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Если оставить пустым — сгенерируется из заголовка (с транслитерацией).
                Допускаются латиница, цифры и дефисы.
              </span>
              {slug && (
                <span className="text-foreground/70 font-mono truncate max-w-[200px]">
                  /cases/{slug}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Краткое описание</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Содержимое</Label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Описание кейса..." />
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Публикация</h3>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Опубликовано</Label>
                <Switch checked={published} onCheckedChange={setPublished} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Рекомендуемое</Label>
                <Switch checked={featured} onCheckedChange={setFeatured} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Label>Обложка</Label>
              {coverImage ? (
                <div className="relative mb-2">
                  { }
                  <img src={coverImage} alt="" className="w-full aspect-video object-cover rounded" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => setCoverImage('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="border border-dashed rounded p-4 text-center text-sm text-muted-foreground mb-2">
                  Нет обложки
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  <ImageIcon className="h-4 w-4 mr-1" /> Загрузить
                </label>
              </Button>
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="или URL"
                className="text-xs"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="client">Клиент</Label>
              <Input id="client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Название компании" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Label htmlFor="results">Результат</Label>
              <Input
                id="results"
                value={results}
                onChange={(e) => setResults(e.target.value)}
                placeholder="например: +150% трафика, 2x ROAS"
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Label>Теги</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  placeholder="тег"
                />
                <Button type="button" size="icon" onClick={addTag}>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
