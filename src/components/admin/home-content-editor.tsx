'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { apiGetSettings, apiUpdateSettings } from '@/lib/api-client'
import { toast } from 'sonner'

type HeroData = {
  heroTitle: string
  heroSubtitle: string
  heroBackground: string
  heroCtaText: string
  heroCtaLink: string
  heroWhatsappText: string
  heroWhatsappLink: string
}

const EMPTY: HeroData = {
  heroTitle: '', heroSubtitle: '', heroBackground: '',
  heroCtaText: '', heroCtaLink: '', heroWhatsappText: '', heroWhatsappLink: '',
}

export function HomeContentEditor() {
  const [data, setData] = useState<HeroData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGetSettings()
      .then((d) => setData({ ...EMPTY, ...d }))
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) { toast.error('Ошибка загрузки'); return }
      const result = await res.json()
      setData((prev) => ({ ...prev, heroBackground: result.url }))
      toast.success('Загружено')
    } finally { e.target.value = '' }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await apiUpdateSettings({
        heroTitle: data.heroTitle || null,
        heroSubtitle: data.heroSubtitle || null,
        heroBackground: data.heroBackground || null,
        heroCtaText: data.heroCtaText || null,
        heroCtaLink: data.heroCtaLink || null,
        heroWhatsappText: data.heroWhatsappText || null,
        heroWhatsappLink: data.heroWhatsappLink || null,
      } as any)
      if (result.ok) {
        toast.success('Сохранено')
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
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Главная — HERO</h1>
        <p className="text-sm text-muted-foreground">Заголовок, подзаголовок, кнопки и фон</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">H1 — Заголовок</Label>
            <Input id="heroTitle" value={data.heroTitle || ''} onChange={(e) => setData({ ...data, heroTitle: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Подзаголовок</Label>
            <Textarea id="heroSubtitle" value={data.heroSubtitle || ''} onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="heroCtaText">Текст основной кнопки</Label>
              <Input id="heroCtaText" value={data.heroCtaText || ''} onChange={(e) => setData({ ...data, heroCtaText: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroCtaLink">Ссылка основной кнопки</Label>
              <Input id="heroCtaLink" value={data.heroCtaLink || ''} onChange={(e) => setData({ ...data, heroCtaLink: e.target.value })} placeholder="#cta или URL" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="heroWhatsappText">Текст кнопки WhatsApp</Label>
              <Input id="heroWhatsappText" value={data.heroWhatsappText || ''} onChange={(e) => setData({ ...data, heroWhatsappText: e.target.value })} placeholder="Написать в WhatsApp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroWhatsappLink">Ссылка WhatsApp</Label>
              <Input id="heroWhatsappLink" value={data.heroWhatsappLink || ''} onChange={(e) => setData({ ...data, heroWhatsappLink: e.target.value })} placeholder="https://wa.me/77758494020" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Фоновое изображение</Label>
            {data.heroBackground && (
              <div className="flex items-center gap-3 mb-2">
                { }
                <img src={data.heroBackground} alt="Фон" className="h-16 w-28 object-cover rounded border" />
                <Button variant="ghost" size="sm" onClick={() => setData({ ...data, heroBackground: '' })}>
                  <X className="h-4 w-4 mr-1" /> Убрать
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input value={data.heroBackground || ''} onChange={(e) => setData({ ...data, heroBackground: e.target.value })} placeholder="URL фона (пусто = градиент)" />
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                  <ImageIcon className="h-4 w-4 mr-1" /> Загрузить
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Сохранить
        </Button>
      </div>
    </div>
  )
}
