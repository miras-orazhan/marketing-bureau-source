'use client'

import { useEffect, useState } from 'react'
import {
  Plus, Trash2, Loader2, Eye, EyeOff, Save, ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { apiGetSettings, apiUpdateSettings } from '@/lib/api-client'
import { toast } from 'sonner'

type Item = {
  id: string
  title: string
  description: string | null
  icon: string | null
  iconImage: string | null
  sortOrder: number
  published: boolean
  updatedAt: string
}

type SimpleItemsManagerProps = {
  title: string
  description: string
  /** Ключи полей заголовка и описания секции в SiteSettings */
  sectionTitleField?: string
  sectionTextField?: string
  /** Создать элемент */
  onCreate: (input: { title: string; description?: string; icon?: string; iconImage?: string | null; sortOrder?: number; published?: boolean }) => Promise<{ ok: boolean; id?: string; error?: string }>
  /** Обновить элемент */
  onUpdate: (id: string, input: Partial<{ title: string; description?: string; icon?: string; iconImage?: string | null; sortOrder?: number; published?: boolean }>) => Promise<{ ok: boolean; error?: string }>
  /** Удалить элемент */
  onDelete: (id: string) => Promise<{ ok: boolean; error?: string }>
  /** Список */
  onList: () => Promise<Item[]>
}

export function SimpleItemsManager({
  title,
  description,
  sectionTitleField,
  sectionTextField,
  onCreate,
  onUpdate,
  onDelete,
  onList,
}: SimpleItemsManagerProps) {
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
    onList()
      .then(setItems)
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }

  // Загружаем заголовок и описание секции из настроек
  useEffect(() => {
    if (sectionTitleField || sectionTextField) {
      apiGetSettings().then((s: any) => {
        if (sectionTitleField) setSectionTitle(s[sectionTitleField] || '')
        if (sectionTextField) setSectionText(s[sectionTextField] || '')
      }).catch(() => {})
    }
    load()
     
  }, [])

  const handleSaveSection = async () => {
    if (!sectionTitleField && !sectionTextField) return
    setSectionSaving(true)
    try {
      const update: any = {}
      if (sectionTitleField) update[sectionTitleField] = sectionTitle || null
      if (sectionTextField) update[sectionTextField] = sectionText || null
      const res = await apiUpdateSettings(update)
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
      const res = await onDelete(confirmDelete)
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

  // ─── Режим редактирования ─────────────────────────────────
  if (editing) {
    const isNew = !editing.id
    return (
      <ItemEditor
        item={editing}
        sectionTitle={title}
        accentColor="#10b981"
        onBack={() => {
          setEditing(null)
          load()
        }}
        onSave={async (input) => {
          // ВАЖНО: различаем создание и обновление по наличию id.
          // Раньше всегда вызывался onUpdate(editing.id, ...) — это ломало
          // создание новых элементов (P2025: No record was found for an update).
          const res = isNew
            ? await onCreate(input as any)
            : await onUpdate(editing.id, input)
          if (res.ok) {
            toast.success(isNew ? 'Создано' : 'Сохранено')
            return true
          }
          // Если сервер говорит, что запись не найдена (404) — обновим список,
          // потому что наш стейт рассинхронизирован с БД.
          if (res.error && /not found|не найден|P2025/i.test(res.error)) {
            toast.error('Элемент больше не существует. Список обновлён.')
            setTimeout(() => load(), 500)
          } else {
            toast.error(res.error || 'Ошибка')
          }
          return false
        }}
      />
    )
  }

  // ─── Список элементов ─────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={() => setEditing({} as any)}>
          <Plus className="h-4 w-4 mr-1" /> Создать блок
        </Button>
      </div>

      {/* Заголовок и описание секции (H2 + текст) */}
      {(sectionTitleField || sectionTextField) && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Заголовок секции (H2)</Label>
              <Input
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="Например: Наша экспертиза"
              />
            </div>
            <div className="space-y-2">
              <Label>Описание секции</Label>
              <RichTextEditor
                value={sectionText}
                onChange={setSectionText}
                placeholder="Краткое описание секции..."
              />
            </div>
            <Button onClick={handleSaveSection} disabled={sectionSaving} size="sm">
              {sectionSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Сохранить заголовок
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Список блоков */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Блоки контента</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Пока нет элементов. Создайте первый!</p>
          <Button onClick={() => setEditing({} as any)}>
            <Plus className="h-4 w-4 mr-1" /> Создать
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center gap-3">
                <DynamicIcon
                  name={item.icon}
                  className="h-7 w-7 text-primary shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="font-medium truncate">{item.title}</div>
                  {item.description && (
                    <div
                      className="text-xs text-muted-foreground line-clamp-1 prose prose-sm [&_*]:inline [&_p]:m-0"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={item.published}
                      onCheckedChange={async (v) => {
                        const res = await onUpdate(item.id, { published: v })
                        if (res.ok) {
                          setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: v } : i)))
                        } else {
                          toast.error(res.error || 'Ошибка')
                        }
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
                    className="text-destructive h-8 w-8 p-0"
                    onClick={() => setConfirmDelete(item.id)}
                    title="Удалить"
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
            <DialogTitle>Удалить элемент?</DialogTitle>
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

// ────────────────────────────────────────────────────────────
// ПОЛНОЭКРАННЫЙ РЕДАКТОР ЭЛЕМЕНТА
// (как в ServicesManager — двухколоночный layout, просторно)
// ────────────────────────────────────────────────────────────

function ItemEditor({
  item,
  sectionTitle,
  accentColor,
  onBack,
  onSave,
}: {
  item: Item | null
  sectionTitle: string
  accentColor: string
  onBack: () => void
  onSave: (input: { title: string; description?: string; icon?: string; iconImage?: string | null; published?: boolean }) => Promise<boolean>
}) {
  const isNew = !item?.id
  const [title, setTitle] = useState(item?.title || '')
  const [description, setDescription] = useState(item?.description || '')
  const [icon, setIcon] = useState(item?.icon || 'star')
  const [iconImage, setIconImage] = useState<string | null>(item?.iconImage || null)
  const [published, setPublished] = useState(item?.published ?? true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (item) {
      setTitle(item.title || '')
      setDescription(item.description || '')
      setIcon(item.icon || 'star')
      setIconImage(item.iconImage || null)
      setPublished(item.published ?? true)
    }
  }, [item])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Заголовок обязателен')
      return
    }
    setSaving(true)
    try {
      const ok = await onSave({
        title: title.trim(),
        description: description || undefined,
        icon,
        iconImage: iconImage === null ? null : (iconImage || undefined),
        published,
      })
      if (ok) onBack()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Breadcrumbs
          items={[
            { label: sectionTitle, onClick: onBack },
            { label: isNew ? 'Новый' : (item?.title || 'Редактирование') },
          ]}
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? 'Новый элемент' : 'Редактирование'}
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
        {/* Левая колонка — основной контент (2/3 ширины) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
              placeholder="Введите заголовок"
            />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Подробное описание с форматированием..."
            />
          </div>
        </div>

        {/* Правая колонка — настройки (1/3 ширины) */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Публикация</h3>
              <div className="flex items-center justify-between">
                <Label className="cursor-pointer">Опубликовано</Label>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={published}
                    onCheckedChange={setPublished}
                  />
                  {published ? (
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                  )}
                </div>
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
                accentColor={accentColor}
              />
              <p className="text-xs text-muted-foreground">
                Можно выбрать Lucide-иконку или загрузить своё изображение.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
