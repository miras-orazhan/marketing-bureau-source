'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { DynamicIcon } from '@/components/site/dynamic-icon'
import { IconPicker } from './icon-picker'
import { Breadcrumbs } from './breadcrumbs'
import { RichTextEditor } from '@/components/rich-text-editor'
import {
  apiListServices,
  apiCreateService,
  apiUpdateService,
  apiDeleteService,
  apiGetSettings,
  apiUpdateSettings,
} from '@/lib/api-client'
import { toast } from 'sonner'

type Item = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  icon: string | null
  iconImage: string | null
  sortOrder: number
  published: boolean
  featured: boolean
  updatedAt: string
}

export function ServicesManager() {
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
    apiListServices()
      .then(setItems)
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    apiGetSettings().then((s: any) => {
      setSectionTitle(s.servicesSectionTitle || '')
      setSectionText(s.servicesSectionText || '')
    }).catch(() => {})
    load()
  }, [])

  const handleSaveSection = async () => {
    setSectionSaving(true)
    try {
      const res = await apiUpdateSettings({
        servicesSectionTitle: sectionTitle || null,
        servicesSectionText: sectionText || null,
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
      const res = await apiDeleteService(confirmDelete)
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
      <ServiceEditor
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
          <h1 className="text-2xl font-bold">Услуги</h1>
          <p className="text-sm text-muted-foreground">
            Услуги компании. Отображаются на главной и на странице «Услуги».
          </p>
        </div>
        <Button onClick={() => setEditing({} as any)}>
          <Plus className="h-4 w-4 mr-1" /> Создать услугу
        </Button>
      </div>

      {/* Заголовок и описание секции (H2 + текст) */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Заголовок секции (H2)</Label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Например: Услуги" />
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
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Услуги</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Пока нет услуг. Создайте первую!</p>
          <Button onClick={() => setEditing({} as any)}>
            <Plus className="h-4 w-4 mr-1" /> Создать услугу
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center gap-3">
                <DynamicIcon name={item.icon} image={item.iconImage} className="h-7 w-7 text-primary shrink-0" imgClassName="h-7 w-7 object-cover shrink-0 rounded" />
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    /{item.slug} · {item.excerpt || 'без описания'}
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  {item.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      ★ Рекоменд.
                    </span>
                  )}
                  <Toggle
                    checked={item.published}
                    onChange={async (v) => {
                      const res = await apiUpdateService(item.id, { published: v })
                      if (res.ok) {
                        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: v } : i)))
                      } else {
                        toast.error(res.error || 'Ошибка')
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive h-8 w-8 p-0"
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
            <DialogTitle>Удалить услугу?</DialogTitle>
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-1">
      <Switch checked={checked} onCheckedChange={onChange} />
      {checked ? (
        <Eye className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <EyeOff className="h-3.5 w-3.5 text-amber-600" />
      )}
    </div>
  )
}

function ServiceEditor({
  item,
  onBack,
}: {
  item: Item | null
  onBack: () => void
}) {
  const isNew = !item?.id
  const [title, setTitle] = useState(item?.title || '')
  const [excerpt, setExcerpt] = useState(item?.excerpt || '')
  const [content, setContent] = useState(item?.content || '')
  const [icon, setIcon] = useState(item?.icon || 'star')
  const [iconImage, setIconImage] = useState<string | null>(item?.iconImage || null)
  const [published, setPublished] = useState(item?.published ?? true)
  const [featured, setFeatured] = useState(item?.featured ?? false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setTitle(item.title || '')
      setExcerpt(item.excerpt || '')
      setContent(item.content || '')
      setIcon(item.icon || 'star')
      setIconImage(item.iconImage || null)
      setPublished(item.published ?? true)
      setFeatured(item.featured ?? false)
    }
  }, [item])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Заголовок обязателен')
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        content,
        icon,
        iconImage: iconImage === null ? null : (iconImage || undefined),
        published,
        featured,
      }
      const res = isNew
        ? await apiCreateService(payload)
        : await apiUpdateService(item!.id, payload)
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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Breadcrumbs
          items={[
            { label: 'Услуги', onClick: onBack },
            { label: isNew ? 'Новая' : (item?.title || 'Редактирование') },
          ]}
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? 'Новая услуга' : 'Редактирование услуги'}
              </h1>
            </div>
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
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
              placeholder="Например: Performance-маркетинг"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Краткое описание</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="1-2 предложения для карточки"
            />
          </div>
          <div className="space-y-2">
            <Label>Подробное описание</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Подробное описание услуги..."
            />
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
              <Label>Иконка / изображение</Label>
              <IconPicker
                value={icon}
                onChange={setIcon}
                imageUrl={iconImage}
                onImageChange={setIconImage}
                accentColor="#10b981"
              />
              <p className="text-xs text-muted-foreground">
                Можно выбрать Lucide-иконку из списка или загрузить своё изображение (приоритет).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
