'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichTextEditor } from '@/components/rich-text-editor'
import { apiGetPrivacy, apiUpdatePrivacy } from '@/lib/api-client'
import { toast } from 'sonner'

export function PrivacyManager() {
  const [title, setTitle] = useState('')
  const [intro, setIntro] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiGetPrivacy()
      .then((d) => {
        setTitle(d.title || '')
        setIntro(d.intro || '')
        setContent(d.content || '')
      })
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await apiUpdatePrivacy({
        title: title.trim() || 'Политика конфиденциальности',
        intro: intro.trim() || null,
        content,
      })
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Политика конфиденциальности</h1>
          <p className="text-sm text-muted-foreground">
            Редактируемый текст политики. Отображается на странице /?section=privacy.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Сохранить
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="privacy-title">Заголовок страницы</Label>
            <Input
              id="privacy-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Политика конфиденциальности"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="privacy-intro">Вступительный абзац</Label>
            <Textarea
              id="privacy-intro"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              placeholder="Краткое вступление перед основным текстом..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Основной текст политики</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Текст политики конфиденциальности с форматированием..."
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
          Сохранить изменения
        </Button>
      </div>
    </div>
  )
}
