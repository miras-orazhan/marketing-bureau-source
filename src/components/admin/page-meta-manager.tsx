'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Search, Globe, ShieldOff, Code2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { apiListPageMeta, apiUpdatePageMeta } from '@/lib/api-client'
import type { PageSlug } from '@/lib/page-meta'
import { toast } from 'sonner'

type PageMetaRow = {
  id: string
  slug: string
  label: string
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  robotsIndex: boolean
  canonicalUrl: string | null
  schemaOrg: string | null
}

type EditState = {
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  robotsIndex: boolean
  canonicalUrl: string
  schemaOrg: string
}

function toEditState(row: PageMetaRow): EditState {
  return {
    title: row.title || '',
    description: row.description || '',
    keywords: row.keywords || '',
    ogTitle: row.ogTitle || '',
    ogDescription: row.ogDescription || '',
    ogImage: row.ogImage || '',
    twitterTitle: row.twitterTitle || '',
    twitterDescription: row.twitterDescription || '',
    twitterImage: row.twitterImage || '',
    robotsIndex: row.robotsIndex,
    canonicalUrl: row.canonicalUrl || '',
    schemaOrg: row.schemaOrg || '',
  }
}

export function PageMetaManager() {
  const [rows, setRows] = useState<PageMetaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState<PageSlug | null>(null)
  const [edit, setEdit] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiListPageMeta()
      .then((items) => {
        setRows(items)
        if (items.length > 0) {
          setSelectedSlug(items[0].slug as PageSlug)
          setEdit(toEditState(items[0]))
        }
      })
      .catch((e) => toast.error(e?.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  const selectPage = (slug: PageSlug) => {
    const row = rows.find((r) => r.slug === slug)
    if (!row) return
    setSelectedSlug(slug)
    setEdit(toEditState(row))
  }

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'ogImage' | 'twitterImage'
  ) => {
    const file = e.target.files?.[0]
    if (!file || !edit) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Ошибка загрузки')
        return
      }
      const result = await res.json()
      setEdit({ ...edit, [field]: result.url })
      toast.success('Загружено')
    } finally {
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    if (!selectedSlug || !edit) return
    setSaving(true)
    try {
      const result = await apiUpdatePageMeta(selectedSlug, {
        title: edit.title.trim() || null,
        description: edit.description.trim() || null,
        keywords: edit.keywords.trim() || null,
        ogTitle: edit.ogTitle.trim() || null,
        ogDescription: edit.ogDescription.trim() || null,
        ogImage: edit.ogImage.trim() || null,
        twitterTitle: edit.twitterTitle.trim() || null,
        twitterDescription: edit.twitterDescription.trim() || null,
        twitterImage: edit.twitterImage.trim() || null,
        robotsIndex: edit.robotsIndex,
        canonicalUrl: edit.canonicalUrl.trim() || null,
        schemaOrg: edit.schemaOrg.trim() || null,
      })
      if (result.ok) {
        toast.success('SEO сохранено')
        // Обновляем локальный список
        setRows((prev) =>
          prev.map((r) =>
            r.slug === selectedSlug
              ? { ...r, ...edit, title: edit.title || null, description: edit.description || null, keywords: edit.keywords || null, ogTitle: edit.ogTitle || null, ogDescription: edit.ogDescription || null, ogImage: edit.ogImage || null, twitterTitle: edit.twitterTitle || null, twitterDescription: edit.twitterDescription || null, twitterImage: edit.twitterImage || null, canonicalUrl: edit.canonicalUrl || null, schemaOrg: edit.schemaOrg || null }
              : r
          )
        )
        window.location.reload()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } finally {
      setSaving(false)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SEO по страницам</h1>
        <p className="text-sm text-muted-foreground">
          Управление мета-данными для каждой страницы. Пустые поля заполняются значениями по умолчанию.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Список страниц */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Страницы
          </p>
          {rows.map((row) => (
            <button
              key={row.slug}
              type="button"
              onClick={() => selectPage(row.slug as PageSlug)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedSlug === row.slug
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{row.label}</span>
                {row.robotsIndex ? (
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {row.title || '(по умолчанию)'}
              </p>
            </button>
          ))}
        </div>

        {/* Форма редактирования */}
        <div className="lg:col-span-3">
          {edit && selectedSlug && (
            <Tabs defaultValue="basic">
              <TabsList className="flex flex-wrap h-auto mb-4">
                <TabsTrigger value="basic">Основное</TabsTrigger>
                <TabsTrigger value="og">Open Graph</TabsTrigger>
                <TabsTrigger value="twitter">Twitter</TabsTrigger>
                <TabsTrigger value="advanced">Дополнительно</TabsTrigger>
              </TabsList>

              {/* Основное */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Основные мета-данные</span>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="robotsIndex" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                          {edit.robotsIndex ? (
                            <>
                              <Eye className="h-3.5 w-3.5 text-emerald-600" />
                              Индексируется
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                              Noindex
                            </>
                          )}
                        </Label>
                        <Switch
                          id="robotsIndex"
                          checked={edit.robotsIndex}
                          onCheckedChange={(v) => setEdit({ ...edit, robotsIndex: v })}
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={edit.title}
                        onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                        placeholder="По умолчанию: «Название страницы — Site Name»"
                      />
                      <p className="text-xs text-muted-foreground">
                        {edit.title.length}/60 символов (рекомендуется 50–60)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={edit.description}
                        onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                        placeholder="Описание страницы для поисковиков"
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        {edit.description.length}/160 символов (рекомендуется 120–160)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="keywords">Keywords (через запятую)</Label>
                      <Input
                        id="keywords"
                        value={edit.keywords}
                        onChange={(e) => setEdit({ ...edit, keywords: e.target.value })}
                        placeholder="маркетинг, алматы, seo, smm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Open Graph */}
              <TabsContent value="og" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Graph (для соц. сетей)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ogTitle">OG Title</Label>
                      <Input
                        id="ogTitle"
                        value={edit.ogTitle}
                        onChange={(e) => setEdit({ ...edit, ogTitle: e.target.value })}
                        placeholder="По умолчанию: как Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ogDescription">OG Description</Label>
                      <Textarea
                        id="ogDescription"
                        value={edit.ogDescription}
                        onChange={(e) => setEdit({ ...edit, ogDescription: e.target.value })}
                        rows={2}
                        placeholder="По умолчанию: как Description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image</Label>
                      {edit.ogImage && (
                        <div className="flex items-center gap-3 mb-2">
                          { }
                          <img src={edit.ogImage} alt="OG" className="h-16 w-28 object-cover rounded border" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEdit({ ...edit, ogImage: '' })}
                          >
                            Убрать
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={edit.ogImage}
                          onChange={(e) => setEdit({ ...edit, ogImage: e.target.value })}
                          placeholder="URL изображения"
                        />
                        <Button variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUpload(e, 'ogImage')}
                            />
                            Загрузить
                          </label>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Рекомендуемый размер: 1200×630 px.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Twitter */}
              <TabsContent value="twitter" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Twitter Card</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitterTitle">Twitter Title</Label>
                      <Input
                        id="twitterTitle"
                        value={edit.twitterTitle}
                        onChange={(e) => setEdit({ ...edit, twitterTitle: e.target.value })}
                        placeholder="По умолчанию: как OG Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterDescription">Twitter Description</Label>
                      <Textarea
                        id="twitterDescription"
                        value={edit.twitterDescription}
                        onChange={(e) => setEdit({ ...edit, twitterDescription: e.target.value })}
                        rows={2}
                        placeholder="По умолчанию: как OG Description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Twitter Image</Label>
                      {edit.twitterImage && (
                        <div className="flex items-center gap-3 mb-2">
                          { }
                          <img src={edit.twitterImage} alt="Twitter" className="h-16 w-28 object-cover rounded border" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEdit({ ...edit, twitterImage: '' })}
                          >
                            Убрать
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          value={edit.twitterImage}
                          onChange={(e) => setEdit({ ...edit, twitterImage: e.target.value })}
                          placeholder="URL изображения (по умолчанию: OG Image)"
                        />
                        <Button variant="outline" size="sm" asChild>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUpload(e, 'twitterImage')}
                            />
                            Загрузить
                          </label>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Дополнительно */}
              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      Schema.org JSON-LD
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Textarea
                      value={edit.schemaOrg}
                      onChange={(e) => setEdit({ ...edit, schemaOrg: e.target.value })}
                      placeholder='{"@context":"https://schema.org","@type":"WebPage",...}'
                      rows={10}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Если оставить пустым — будет сгенерирован автоматически по типу страницы (Organization / WebPage / FAQPage).
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Canonical URL
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      value={edit.canonicalUrl}
                      onChange={(e) => setEdit({ ...edit, canonicalUrl: e.target.value })}
                      placeholder="https://example.com/page (если нужен кастомный canonical)"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sticky кнопка сохранить */}
              <div className="sticky bottom-4 flex justify-end mt-4">
                <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" /> Сохранить SEO
                    </>
                  )}
                </Button>
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
