'use client'

import { useEffect, useState } from 'react'
import { Trash2, Loader2, Mail, Phone, MessageSquare, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { apiListLeads, apiDeleteLead } from '@/lib/api-client'
import { toast } from 'sonner'

type Lead = {
  id: string
  name: string
  phone: string
  email: string | null
  message: string | null
  source: string | null
  createdAt: string
}

export function LeadsManager() {
  const [items, setItems] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    apiListLeads()
      .then(setItems)
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await apiDeleteLead(confirmDelete)
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

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Заявки</h1>
          <p className="text-sm text-muted-foreground">
            Заявки, отправленные через CTA-форму. Всего: {items.length}
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          Обновить
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Пока нет заявок.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Заявки с CTA-формы будут появляться здесь.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.message && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xs">
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        {item.message}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {item.phone}
                    </a>
                  </TableCell>
                  <TableCell>
                    {item.email ? (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {item.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.source ? (
                      <Badge variant="secondary" className="text-xs">
                        {item.source}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setConfirmDelete(item.id)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить заявку?</DialogTitle>
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
