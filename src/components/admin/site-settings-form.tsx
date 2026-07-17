'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Image as ImageIcon, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiGetSettings, apiUpdateSettings } from '@/lib/api-client'
import { toast } from 'sonner'

type RawSettings = {
  id: string
  siteName: string
  logoUrl: string | null
  logoText: string | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  metaAuthor: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  ogType: string
  twitterCard: string
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  favicon: string | null
  email: string | null
  phone: string | null
  address: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  telegram: string | null
  primaryColor: string
  accentColor: string
  backgroundColor: string
  robotsIndex: boolean
  googleAnalytics: string | null
  yandexMetrika: string | null
  googleTagManager: string | null
  siteUrl: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  heroBackground: string | null
  footerText: string | null
  aboutText: string | null
}

const EMPTY: RawSettings = {
  id: 'default',
  siteName: 'Информационный портал',
  logoUrl: null,
  logoText: null,
  metaTitle: null,
  metaDescription: null,
  metaKeywords: null,
  metaAuthor: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: null,
  twitterDescription: null,
  twitterImage: null,
  favicon: null,
  email: null,
  phone: null,
  address: null,
  facebook: null,
  twitter: null,
  instagram: null,
  youtube: null,
  telegram: null,
  primaryColor: '#0f172a',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  robotsIndex: true,
  googleAnalytics: null,
  yandexMetrika: null,
  googleTagManager: null,
  siteUrl: 'https://example.com',
  heroTitle: null,
  heroSubtitle: null,
  heroBackground: null,
  footerText: null,
  aboutText: null,
}

export function SiteSettingsForm() {
  const router = useRouter()
  const [data, setData] = useState<RawSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGetSettings()
      .then((d) => setData({ ...EMPTY, ...d }))
      .catch((e) => toast.error(e?.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'favicon' | 'ogImage' | 'twitterImage' | 'heroBackground'
  ) => {
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
      const result = await res.json()
      setData((prev) => ({ ...prev, [field]: result.url }))
      toast.success('Загружено')
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка')
    } finally {
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await apiUpdateSettings({
        ...data,
      })
      if (result.ok) {
        toast.success('Настройки сохранены')
        // Принудительно перезагружаем, чтобы SSR-метаданные обновились
        window.location.reload()
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } finally {
      setSaving(false)
    }
  }

  const fillDefaults = () => {
    setData((prev) => ({
      ...prev,
      metaTitle: prev.metaTitle || `${prev.siteName} — актуальные статьи и новости`,
      metaDescription:
        prev.metaDescription ||
        `${prev.siteName} — современный информационный портал. Читайте свежие статьи и новости каждый день.`,
      ogTitle: prev.ogTitle || prev.metaTitle || `${prev.siteName} — актуальные статьи и новости`,
      ogDescription:
        prev.ogDescription ||
        prev.metaDescription ||
        `${prev.siteName} — современный информационный портал.`,
      twitterTitle: prev.twitterTitle || prev.ogTitle,
      twitterDescription: prev.twitterDescription || prev.ogDescription,
      metaAuthor: prev.metaAuthor || prev.siteName,
      metaKeywords: prev.metaKeywords || 'статьи, новости, портал, медиа',
      heroTitle: prev.heroTitle || 'Добро пожаловать на наш портал',
      heroSubtitle: prev.heroSubtitle || 'Актуальные статьи и новости каждый день',
      footerText: prev.footerText || `© ${new Date().getFullYear()} ${prev.siteName}. Все права защищены.`,
    }))
    toast.info('Поля заполнены значениями по умолчанию. Не забудьте сохранить.')
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Настройки сайта</h1>
          <p className="text-sm text-muted-foreground">
            Брендинг, мета-данные, контакты и темы. Пустые поля мета-данных заполняются автоматически.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fillDefaults}>
            <RefreshCw className="h-4 w-4 mr-1" /> Заполнить по умолчанию
          </Button>
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

      <Tabs defaultValue="branding">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="branding">Брендинг</TabsTrigger>
          <TabsTrigger value="meta">Мета-данные</TabsTrigger>
          <TabsTrigger value="og">Open Graph / Twitter</TabsTrigger>
          <TabsTrigger value="seo">SEO и аналитика</TabsTrigger>
        </TabsList>

        {/* Брендинг */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Логотип и название</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Название сайта</Label>
                <Input
                  id="siteName"
                  value={data.siteName}
                  onChange={(e) => setData({ ...data, siteName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Логотип (картинка)</Label>
                {data.logoUrl ? (
                  <div className="flex items-center gap-3">
                    { }
                    <img
                      src={data.logoUrl}
                      alt="Логотип"
                      className="h-12 w-auto max-w-[200px] object-contain border rounded p-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setData({ ...data, logoUrl: null })}
                    >
                      <X className="h-4 w-4 mr-1" /> Убрать
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground border border-dashed rounded p-4 text-center">
                    Логотип не загружен — будет показан текстовый
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'logoUrl')}
                      />
                      <ImageIcon className="h-4 w-4 mr-1" /> Загрузить
                    </label>
                  </Button>
                </div>
                <Input
                  value={data.logoUrl || ''}
                  onChange={(e) => setData({ ...data, logoUrl: e.target.value || null })}
                  placeholder="или вставьте URL логотипа"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoText">Текстовый логотип (если нет картинки)</Label>
                <Input
                  id="logoText"
                  value={data.logoText || ''}
                  onChange={(e) => setData({ ...data, logoText: e.target.value || null })}
                  placeholder="По умолчанию используется название сайта"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="favicon"
                    value={data.favicon || ''}
                    onChange={(e) => setData({ ...data, favicon: e.target.value || null })}
                    placeholder="/favicon.ico"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, 'favicon')}
                      />
                      Загрузить
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Цвета темы</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Цвет фона</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.backgroundColor}
                    onChange={(e) => setData({ ...data, backgroundColor: e.target.value })}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={data.backgroundColor}
                    onChange={(e) => setData({ ...data, backgroundColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Основной цвет</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.primaryColor}
                    onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={data.primaryColor}
                    onChange={(e) => setData({ ...data, primaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Акцентный цвет</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.accentColor}
                    onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <Input
                    value={data.accentColor}
                    onChange={(e) => setData({ ...data, accentColor: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Мета-данные */}
        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Основные мета-данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex gap-2">
                <span>
                  Если поле оставить пустым — оно автоматически заполнится подходящим значением по умолчанию.
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={data.metaTitle || ''}
                  onChange={(e) => setData({ ...data, metaTitle: e.target.value || null })}
                  placeholder="По умолчанию: «Название сайта — актуальные статьи и новости»"
                />
                <p className="text-xs text-muted-foreground">
                  {(data.metaTitle || '').length}/60 символов (рекомендуется 50–60)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={data.metaDescription || ''}
                  onChange={(e) => setData({ ...data, metaDescription: e.target.value || null })}
                  placeholder="Краткое описание сайта для поисковиков"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {(data.metaDescription || '').length}/160 символов (рекомендуется 120–160)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords (через запятую)</Label>
                <Input
                  id="metaKeywords"
                  value={data.metaKeywords || ''}
                  onChange={(e) => setData({ ...data, metaKeywords: e.target.value || null })}
                  placeholder="статьи, новости, портал"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaAuthor">Meta Author</Label>
                <Input
                  id="metaAuthor"
                  value={data.metaAuthor || ''}
                  onChange={(e) => setData({ ...data, metaAuthor: e.target.value || null })}
                  placeholder="По умолчанию: название сайта"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Open Graph / Twitter */}
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
                  value={data.ogTitle || ''}
                  onChange={(e) => setData({ ...data, ogTitle: e.target.value || null })}
                  placeholder="По умолчанию: как Meta Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ogDescription">OG Description</Label>
                <Textarea
                  id="ogDescription"
                  value={data.ogDescription || ''}
                  onChange={(e) => setData({ ...data, ogDescription: e.target.value || null })}
                  rows={2}
                  placeholder="По умолчанию: как Meta Description"
                />
              </div>
              <div className="space-y-2">
                <Label>OG Image</Label>
                {data.ogImage && (
                  <div className="flex items-center gap-3 mb-2">
                    { }
                    <img
                      src={data.ogImage}
                      alt="OG"
                      className="h-16 w-28 object-cover rounded border"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setData({ ...data, ogImage: null })}
                    >
                      <X className="h-4 w-4 mr-1" /> Убрать
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={data.ogImage || ''}
                    onChange={(e) => setData({ ...data, ogImage: e.target.value || null })}
                    placeholder="URL изображения для превью"
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
              <div className="space-y-2">
                <Label htmlFor="ogType">OG Type</Label>
                <Input
                  id="ogType"
                  value={data.ogType}
                  onChange={(e) => setData({ ...data, ogType: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Twitter Card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitterCard">Twitter Card Type</Label>
                <Input
                  id="twitterCard"
                  value={data.twitterCard}
                  onChange={(e) => setData({ ...data, twitterCard: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterTitle">Twitter Title</Label>
                <Input
                  id="twitterTitle"
                  value={data.twitterTitle || ''}
                  onChange={(e) => setData({ ...data, twitterTitle: e.target.value || null })}
                  placeholder="По умолчанию: как OG Title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterDescription">Twitter Description</Label>
                <Textarea
                  id="twitterDescription"
                  value={data.twitterDescription || ''}
                  onChange={(e) => setData({ ...data, twitterDescription: e.target.value || null })}
                  rows={2}
                  placeholder="По умолчанию: как OG Description"
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter Image</Label>
                {data.twitterImage && (
                  <div className="flex items-center gap-3 mb-2">
                    { }
                    <img
                      src={data.twitterImage}
                      alt="Twitter"
                      className="h-16 w-28 object-cover rounded border"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setData({ ...data, twitterImage: null })}
                    >
                      <X className="h-4 w-4 mr-1" /> Убрать
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={data.twitterImage || ''}
                    onChange={(e) => setData({ ...data, twitterImage: e.target.value || null })}
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

        {/* SEO и аналитика */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO и индексация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL сайта (для canonical)</Label>
                <Input
                  id="siteUrl"
                  value={data.siteUrl || ''}
                  onChange={(e) => setData({ ...data, siteUrl: e.target.value || null })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="robotsIndex" className="cursor-pointer">
                  Разрешить индексацию поисковиками
                </Label>
                <Switch
                  id="robotsIndex"
                  checked={data.robotsIndex}
                  onCheckedChange={(v) => setData({ ...data, robotsIndex: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Аналитика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleTagManager">Google Tag Manager ID</Label>
                <Input
                  id="googleTagManager"
                  value={data.googleTagManager || ''}
                  onChange={(e) => setData({ ...data, googleTagManager: e.target.value || null })}
                  placeholder="GTM-XXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Если задано — GTM подключается автоматически на всех страницах
                  (head-скрипт + noscript). GA и Yandex.Metrika при этом
                  настраиваются внутри контейнера GTM.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleAnalytics">Google Analytics ID</Label>
                <Input
                  id="googleAnalytics"
                  value={data.googleAnalytics || ''}
                  onChange={(e) => setData({ ...data, googleAnalytics: e.target.value || null })}
                  placeholder="G-XXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Подключается напрямую, только если не задан GTM. Иначе —
                  настраивайте через GTM.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="yandexMetrika">Yandex.Metrika ID</Label>
                <Input
                  id="yandexMetrika"
                  value={data.yandexMetrika || ''}
                  onChange={(e) => setData({ ...data, yandexMetrika: e.target.value || null })}
                  placeholder="XXXXXXXX"
                />
                <p className="text-xs text-muted-foreground">
                  Подключается напрямую, только если не задан GTM. Иначе —
                  настраивайте через GTM.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky кнопка сохранить */}
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Сохранение...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" /> Сохранить настройки
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
