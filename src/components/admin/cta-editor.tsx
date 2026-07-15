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

type CtaData = {
  ctaSectionTitle: string
  ctaSectionText: string
  ctaBackground: string
  ctaBullet1: string
  ctaBullet2: string
  ctaBullet3: string
}

const EMPTY: CtaData = {
  ctaSectionTitle: '', ctaSectionText: '',
  ctaBackground: '', ctaBullet1: '', ctaBullet2: '', ctaBullet3: '',
}

export function CtaEditor() {
  const [data, setData] = useState<CtaData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGetSettings().then((d) => setData({ ...EMPTY, ...d })).catch((e) => toast.error(e?.message)).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await apiUpdateSettings({
        ctaSectionTitle: data.ctaSectionTitle || null,
        ctaSectionText: data.ctaSectionText || null,
        ctaBackground: data.ctaBackground || null,
        ctaBullet1: data.ctaBullet1 || null,
        ctaBullet2: data.ctaBullet2 || null,
        ctaBullet3: data.ctaBullet3 || null,
      } as any)
      if (result.ok) { toast.success('Сохранено'); window.location.reload() }
      else toast.error(result.error || 'Ошибка')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...</div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">CTA-баннер</h1><p className="text-sm text-muted-foreground">Заголовок, текст, кнопка, фон и преимущества</p></div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2"><Label htmlFor="ctaTitle">Заголовок</Label><Input id="ctaTitle" value={data.ctaSectionTitle || ''} onChange={(e) => setData({ ...data, ctaSectionTitle: e.target.value })} /></div>
          <div className="space-y-2"><Label htmlFor="ctaText">Текст</Label><Textarea id="ctaText" value={data.ctaSectionText || ''} onChange={(e) => setData({ ...data, ctaSectionText: e.target.value })} rows={3} /></div>
          <div className="space-y-2">
            <Label>Фоновое изображение</Label>
            {data.ctaBackground && (
              <div className="flex items-center gap-3 mb-2">
                { }
                <img src={data.ctaBackground} alt="CTA bg" className="h-16 w-28 object-cover rounded border" />
                <Button variant="ghost" size="sm" onClick={() => setData({ ...data, ctaBackground: '' })}><X className="h-4 w-4 mr-1" /> Убрать</Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input value={data.ctaBackground || ''} onChange={(e) => setData({ ...data, ctaBackground: e.target.value })} placeholder="URL фона (пусто = градиент)" />
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file) return
                    const formData = new FormData(); formData.append('file', file)
                    try { const res = await fetch('/api/upload', { method: 'POST', body: formData }); if (!res.ok) { toast.error('Ошибка'); return }; const result = await res.json(); setData((prev) => ({ ...prev, ctaBackground: result.url })); toast.success('Загружено') } finally { e.target.value = '' }
                  }} />
                  <ImageIcon className="h-4 w-4 mr-1" /> Загрузить
                </label>
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Преимущества</Label>
            <div className="grid grid-cols-1 gap-3">
              <Input value={data.ctaBullet1 || ''} onChange={(e) => setData({ ...data, ctaBullet1: e.target.value })} placeholder="Преимущество 1" />
              <Input value={data.ctaBullet2 || ''} onChange={(e) => setData({ ...data, ctaBullet2: e.target.value })} placeholder="Преимущество 2" />
              <Input value={data.ctaBullet3 || ''} onChange={(e) => setData({ ...data, ctaBullet3: e.target.value })} placeholder="Преимущество 3" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />} Сохранить
        </Button>
      </div>
    </div>
  )
}
