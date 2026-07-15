'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiGetSettings, apiUpdateSettings } from '@/lib/api-client'
import { toast } from 'sonner'

type FooterData = {
  footerText: string
  email: string
  phone: string
  address: string
}

const EMPTY: FooterData = {
  footerText: '',
  email: '',
  phone: '',
  address: '',
}

export function FooterEditor() {
  const [data, setData] = useState<FooterData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGetSettings()
      .then((d: any) =>
        setData({
          footerText: d.footerText || '',
          email: d.email || '',
          phone: d.phone || '',
          address: d.address || '',
        })
      )
      .catch((e) => toast.error(e?.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await apiUpdateSettings({
        footerText: data.footerText || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
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
        <h1 className="text-2xl font-bold">Футер</h1>
        <p className="text-sm text-muted-foreground">
          Текст копирайта и контакты в подвале сайта
        </p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footerText">Текст футера (copyright)</Label>
            <Textarea
              id="footerText"
              value={data.footerText}
              onChange={(e) => setData({ ...data, footerText: e.target.value })}
              rows={2}
              placeholder="© 2026 Marketing Bureau. Все права защищены."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Контакты</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                placeholder="hello@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={data.phone || ''}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                placeholder="+7 ..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={data.address || ''}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="г. Алматы, ул. ..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Подсказка про соцсети */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Share2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">
              Социальные сети управляются в отдельном разделе
            </p>
            <p className="text-xs text-muted-foreground">
              Ссылки на соцсети (Facebook, Instagram, Telegram и т.д.) больше не
              настраиваются здесь. В сайдбаре слева выберите раздел{' '}
              <span className="font-medium">«Социальные сети»</span> — там можно
              добавлять любые соцсети с выбором готовой иконки или загрузкой
              собственного изображения.
            </p>
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
