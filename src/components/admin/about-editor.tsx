'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { RichTextEditor } from '@/components/rich-text-editor'
import { apiGetSettings, apiUpdateSettings } from '@/lib/api-client'
import { toast } from 'sonner'

export function AboutEditor() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGetSettings().then((s: any) => {
      setTitle(s.aboutTitle || '')
      setDescription(s.aboutDescription || '')
      setContent(s.aboutContent || '')
    }).catch((e) => toast.error(e?.message)).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await apiUpdateSettings({
        aboutTitle: title || null,
        aboutDescription: description || null,
        aboutContent: content || null,
      } as any)
      if (result.ok) { toast.success('Сохранено'); window.location.reload() }
      else toast.error(result.error || 'Ошибка')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">О нас</h1>
        <p className="text-sm text-muted-foreground">Заголовок, описание и rich text контент страницы</p>
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Заголовок страницы (H1)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: О нас" />
          </div>
          <div className="space-y-2">
            <Label>Краткое описание</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Короткое описание для SEO и превью" />
          </div>
          <div className="space-y-2">
            <Label>Основной контент (rich text)</Label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Подробный текст о компании с форматированием..." />
            <p className="text-xs text-muted-foreground">Если пусто — используется краткое описание из «Настройки сайта».</p>
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
