'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Loader2, Eye, EyeOff, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { RichTextEditor } from '@/components/rich-text-editor'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  apiListFaq,
  apiCreateFaq,
  apiUpdateFaq,
  apiDeleteFaq,
  apiGetSettings,
  apiUpdateSettings,
} from '@/lib/api-client'
import { toast } from 'sonner'

type Item = {
  id: string
  question: string
  answer: string
  sortOrder: number
  published: boolean
  updatedAt: string
}

export function FaqManager() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [savingNew, setSavingNew] = useState(false)
  const [sectionTitle, setSectionTitle] = useState('')
  const [sectionText, setSectionText] = useState('')
  const [sectionSaving, setSectionSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiListFaq()
      .then(setItems)
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    apiGetSettings().then((s: any) => {
      setSectionTitle(s.faqSectionTitle || '')
      setSectionText(s.faqSectionText || '')
    }).catch(() => {})
    load()
  }, [])

  const handleSaveSection = async () => {
    setSectionSaving(true)
    try {
      const res = await apiUpdateSettings({
        faqSectionTitle: sectionTitle || null,
        faqSectionText: sectionText || null,
      } as any)
      if (res.ok) toast.success('Заголовок секции сохранён')
      else toast.error(res.error || 'Ошибка')
    } finally {
      setSectionSaving(false)
    }
  }

  const handleCreate = async () => {
    if (!newQ.trim() || !newA.trim()) {
      toast.error('Вопрос и ответ обязательны')
      return
    }
    setSavingNew(true)
    try {
      const res = await apiCreateFaq({
        question: newQ.trim(),
        answer: newA.trim(),
        published: true,
      })
      if (res.ok) {
        toast.success('Создано')
        setNewQ('')
        setNewA('')
        setNewOpen(false)
        load()
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setSavingNew(false)
    }
  }

  const handleUpdate = async (id: string, input: any) => {
    const res = await apiUpdateFaq(id, input)
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...input } : i)))
    } else {
      toast.error(res.error || 'Ошибка')
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await apiDeleteFaq(confirmDelete)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">FAQ</h1>
          <p className="text-sm text-muted-foreground">
            Вопросы и ответы. Отображаются на главной и на странице FAQ.
          </p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Добавить вопрос
        </Button>
      </div>

      {/* Заголовок и описание секции (H2 + текст) */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Заголовок секции (H2)</Label>
            <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Например: Частые вопросы" />
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
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Вопросы</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Пока нет вопросов. Создайте первый!</p>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Добавить вопрос
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <FaqRow
              key={item.id}
              item={item}
              onUpdate={(input) => handleUpdate(item.id, input)}
              onDelete={() => setConfirmDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Диалог создания */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый вопрос</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="q">Вопрос</Label>
              <Input
                id="q"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a">Ответ</Label>
              <Textarea
                id="a"
                value={newA}
                onChange={(e) => setNewA(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={savingNew}>Отмена</Button>
            </DialogClose>
            <Button onClick={handleCreate} disabled={savingNew}>
              {savingNew ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить вопрос?</DialogTitle>
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

function FaqRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: Item
  onUpdate: (input: any) => Promise<void>
  onDelete: () => void
}) {
  const [question, setQuestion] = useState(item.question)
  const [answer, setAnswer] = useState(item.answer)
  const [published, setPublished] = useState(item.published)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setQuestion(item.question)
    setAnswer(item.answer)
    setPublished(item.published)
  }, [item])

  const save = async () => {
    setSaving(true)
    try {
      await onUpdate({
        question: question.trim(),
        answer: answer.trim(),
        published,
      })
      toast.success('Сохранено')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="font-medium"
              placeholder="Вопрос"
            />
            <div className="flex items-center gap-1 shrink-0">
              <Switch checked={published} onCheckedChange={setPublished} />
              {published ? (
                <Eye className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-amber-600" />
              )}
            </div>
          </div>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
            placeholder="Ответ"
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Удалить
            </Button>
            <Button size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
              Сохранить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
