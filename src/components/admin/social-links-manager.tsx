'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Trash2, Loader2, Eye, EyeOff, Save, ExternalLink,
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
import { IconPicker } from './icon-picker'
import {
  apiListSocialLinks,
  apiCreateSocialLink,
  apiUpdateSocialLink,
  apiDeleteSocialLink,
} from '@/lib/api-client'
import { toast } from 'sonner'

type SocialLink = {
  id: string
  name: string
  url: string
  icon: string | null
  iconImage: string | null
  sortOrder: number
  published: boolean
}

type DraftMap = Record<
  string,
  { name: string; url: string; icon: string; iconImage: string | null; sortOrder: number; published: boolean }
>

function toDraft(s: SocialLink) {
  return {
    name: s.name || '',
    url: s.url || '',
    icon: s.icon || 'link',
    iconImage: s.iconImage || null,
    sortOrder: s.sortOrder ?? 0,
    published: s.published,
  }
}

function isDirty(s: SocialLink, d: DraftMap[string]): boolean {
  return (
    s.name !== d.name ||
    s.url !== d.url ||
    (s.icon || 'link') !== d.icon ||
    (s.iconImage || null) !== d.iconImage ||
    (s.sortOrder ?? 0) !== d.sortOrder ||
    s.published !== d.published
  )
}

export function SocialLinksManager() {
  const [items, setItems] = useState<SocialLink[]>([])
  const [drafts, setDrafts] = useState<DraftMap>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await apiListSocialLinks()
      const typed: SocialLink[] = (list || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        icon: s.icon,
        iconImage: s.iconImage,
        sortOrder: s.sortOrder ?? 0,
        published: s.published,
      }))
      setItems(typed)
      const d: DraftMap = {}
      for (const s of typed) d[s.id] = toDraft(s)
      setDrafts(d)
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const res = await apiCreateSocialLink({
        name: 'Новая соцсеть',
        url: 'https://',
        icon: 'link',
        sortOrder: items.length,
        published: false,
      })
      if (res.ok && res.id) {
        toast.success('Создано — заполните поля и сохраните')
        await load()
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleSave = async (id: string) => {
    const d = drafts[id]
    if (!d) return
    if (!d.name.trim()) {
      toast.error('Введите название')
      return
    }
    if (!d.url.trim() || d.url.trim() === 'https://') {
      toast.error('Введите URL')
      return
    }
    setSavingId(id)
    try {
      const res = await apiUpdateSocialLink(id, {
        name: d.name,
        url: d.url,
        icon: d.icon,
        iconImage: d.iconImage,
        sortOrder: d.sortOrder,
        published: d.published,
      })
      if (res.ok) {
        toast.success('Сохранено')
        // Обновляем локальный state из drafts (без полной перезагрузки)
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  name: d.name,
                  url: d.url,
                  icon: d.icon,
                  iconImage: d.iconImage,
                  sortOrder: d.sortOrder,
                  published: d.published,
                }
              : it
          )
        )
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await apiDeleteSocialLink(confirmDelete)
      if (res.ok) {
        toast.success('Удалено')
        setItems((prev) => prev.filter((i) => i.id !== confirmDelete))
        setDrafts((prev) => {
          const copy = { ...prev }
          delete copy[confirmDelete]
          return copy
        })
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  const updateDraft = (id: string, patch: Partial<DraftMap[string]>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка добавить */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Социальные сети</h1>
          <p className="text-sm text-muted-foreground">
            Управляйте списком соцсетей в подвале: название, ссылка, иконка (готовая из набора или загруженное изображение), порядок отображения.
          </p>
        </div>
        <Button onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
          Добавить соцсеть
        </Button>
      </div>

      {/* Подсказка о иконках */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Подсказка:</span>{' '}
            для типичных соцсетей уже есть готовые иконки — Facebook, Instagram, YouTube, Twitter,
            LinkedIn, Telegram (Send), WhatsApp (MessageCircle), GitHub, Twitch, Slack, Dribbble.
            Если нужной иконки нет — загрузите своё изображение (SVG/PNG, квадратное, до 10 МБ).
          </p>
        </CardContent>
      </Card>

      {/* Список */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            Пока нет соцсетей. Пока список пуст, в подвале выводятся старые ссылки из «Настроек сайта».
          </p>
          <Button onClick={handleCreate} disabled={creating}>
            <Plus className="h-4 w-4 mr-1" /> Создать первую
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {[...items]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => {
              const d = drafts[item.id]
              if (!d) return null
              const dirty = isDirty(item, d)
              return (
                <Card key={item.id}>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Левая колонка — основные поля */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Название</Label>
                          <Input
                            value={d.name}
                            onChange={(e) => updateDraft(item.id, { name: e.target.value })}
                            placeholder="Например: Instagram"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ссылка (URL)</Label>
                          <div className="flex gap-2">
                            <Input
                              value={d.url}
                              onChange={(e) => updateDraft(item.id, { url: e.target.value })}
                              placeholder="https://instagram.com/..."
                              inputMode="url"
                            />
                            {d.url && d.url !== 'https://' && (
                              <a
                                href={d.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md border hover:bg-muted"
                                title="Открыть в новой вкладке"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Порядок</Label>
                            <Input
                              type="number"
                              value={d.sortOrder}
                              onChange={(e) =>
                                updateDraft(item.id, {
                                  sortOrder: parseInt(e.target.value || '0', 10) || 0,
                                })
                              }
                              min={0}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Опубликован</Label>
                            <div className="flex items-center gap-2 h-9">
                              <Switch
                                checked={d.published}
                                onCheckedChange={(v) => updateDraft(item.id, { published: v })}
                              />
                              {d.published ? (
                                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Правая колонка — иконка */}
                      <div className="space-y-2">
                        <Label className="text-xs">Иконка / изображение</Label>
                        <IconPicker
                          value={d.icon}
                          onChange={(name) => updateDraft(item.id, { icon: name })}
                          imageUrl={d.iconImage}
                          onImageChange={(url) => updateDraft(item.id, { iconImage: url })}
                          accentColor="#10b981"
                        />
                        <p className="text-xs text-muted-foreground">
                          Выберите готовую иконку из набора или загрузите своё изображение (приоритет).
                        </p>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setConfirmDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Удалить
                      </Button>
                      <div className="flex items-center gap-2">
                        {dirty && (
                          <span className="text-xs text-amber-600">есть несохранённые изменения</span>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleSave(item.id)}
                          disabled={savingId === item.id || !dirty}
                        >
                          {savingId === item.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-1" />
                          )}
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Диалог подтверждения удаления */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить соцсеть?</DialogTitle>
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
