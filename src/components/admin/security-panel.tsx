'use client'

import { useEffect, useState } from 'react'
import { Loader2, KeyRound, ShieldCheck, Users, Plus, Trash2, Send, Phone, CheckCircle2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  apiLogout,
  apiListMembers,
  apiCreateMember,
  apiUpdateMember,
  apiDeleteMember,
} from '@/lib/api-client'
import { toast } from 'sonner'

type Member = {
  id: string
  name: string
  phone: string
  telegramChatId: string | null
  role: string
  published: boolean
  createdAt: string
}

export function SecurityPanel({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [linkingId, setLinkingId] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [webhookInfo, setWebhookInfo] = useState<any>(null)
  const [mainOldPassword, setMainOldPassword] = useState('')
  const [mainNewPassword, setMainNewPassword] = useState('')
  const [mainPasswordLoading, setMainPasswordLoading] = useState(false)

  // Add form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    apiListMembers()
      .then(setMembers)
      .catch((e) => toast.error(e?.message || 'Ошибка'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      toast.error('Заполните все поля')
      return
    }
    setSaving(true)
    try {
      const res = await apiCreateMember({
        name: name.trim(),
        phone: phone.trim(),
        password: password.trim(),
      })
      if (res.ok) {
        toast.success('Участник добавлен')
        setName(''); setPhone(''); setPassword('')
        setAddOpen(false)
        load()
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const res = await apiDeleteMember(confirmDelete)
      if (res.ok) {
        toast.success('Удалён')
        setMembers((prev) => prev.filter((m) => m.id !== confirmDelete))
      } else {
        toast.error(res.error || 'Ошибка')
      }
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  const handleLinkTelegram = async (memberId: string) => {
    setLinkingId(memberId)
    setLinking(true)
    try {
      // Получаем chat_id из последних сообщений бота
      const res = await fetch('/api/telegram-chat-id')
      const data = await res.json()
      if (data.ok && data.chatId) {
        const updateRes = await apiUpdateMember(memberId, { telegramChatId: data.chatId })
        if (updateRes.ok) {
          toast.success(`Telegram привязан: chat_id ${data.chatId}`)
          setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, telegramChatId: data.chatId } : m)))
        } else {
          toast.error(updateRes.error || 'Ошибка')
        }
      } else {
        toast.error('Бот ещё не получал сообщений. Напишите @mb_requests_bot в Telegram.')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка')
    } finally {
      setLinking(false)
      setLinkingId(null)
    }
  }

  const handleMainPasswordChange = async () => {
    if (!mainOldPassword || !mainNewPassword) {
      toast.error('Заполните оба поля')
      return
    }
    if (mainNewPassword.length < 4) {
      toast.error('Минимум 4 символа в новом пароле')
      return
    }
    setMainPasswordLoading(true)
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: mainOldPassword, newPassword: mainNewPassword }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success('Пароль изменён')
        setMainOldPassword('')
        setMainNewPassword('')
      } else {
        toast.error(data.error || 'Ошибка')
      }
    } finally {
      setMainPasswordLoading(false)
    }
  }

  const handleLinkMainTelegram = async () => {
    setLinking(true)
    try {
      const res = await fetch('/api/telegram-chat-id')
      const data = await res.json()
      if (data.ok && data.chatId) {
        // Сохраняем chat_id в SiteSettings через API настроек
        const settingsRes = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ telegramLeadsChatId: data.chatId }),
        })
        if (settingsRes.ok) {
          toast.success(`Telegram привязан: chat_id ${data.chatId}`)
        } else {
          toast.error('Не удалось сохранить chat_id')
        }
      } else {
        toast.error('Бот ещё не получал сообщений. Напишите @mb_requests_bot в Telegram.')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка')
    } finally {
      setLinking(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await apiLogout()
      toast.success('Вы вышли')
      onLoggedOut()
      window.location.reload()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Безопасность</h1>
        <p className="text-sm text-muted-foreground">Управление участниками и доступом</p>
      </div>

      {/* Участники */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Участники
            </span>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Добавить
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Загрузка...
            </div>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Участников пока нет. Главный админ (тел. +77758494020) уже имеет доступ.
              Добавьте участников для совместной работы.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((m) => {
                const isMainAdmin = m.id === '__main_admin__'
                return (
                <div key={m.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{m.name}</span>
                        {isMainAdmin ? (
                          <Badge variant="default" className="bg-primary">Владелец</Badge>
                        ) : (
                          <Badge variant={m.published ? 'default' : 'secondary'}>
                            {m.published ? 'Активен' : 'Отключён'}
                          </Badge>
                        )}
                        {m.telegramChatId && (
                          <Badge variant="outline" className="text-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Telegram привязан
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {m.phone}
                      </div>
                    </div>
                    {!isMainAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={m.published}
                          onCheckedChange={async (v) => {
                            const res = await apiUpdateMember(m.id, { published: v })
                            if (res.ok) {
                              setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, published: v } : x)))
                            } else {
                              toast.error(res.error || 'Ошибка')
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-8 w-8 p-0"
                          onClick={() => setConfirmDelete(m.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Telegram привязка — только для участников */}
                  {!isMainAdmin && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {m.telegramChatId ? (
                      <p className="text-xs text-muted-foreground">
                        chat_id: <code className="bg-muted px-1 rounded">{m.telegramChatId}</code>
                      </p>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLinkTelegram(m.id)}
                        disabled={linking && linkingId === m.id}
                      >
                        {linking && linkingId === m.id ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5 mr-1" />
                        )}
                        Привязать Telegram
                      </Button>
                    )}
                  </div>
                )}

                  {/* Смена пароля и Telegram — только для главного админа */}
                  {isMainAdmin && (
                    <div className="pt-2 border-t space-y-3">
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Сменить пароль</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input
                          type="password"
                          placeholder="Текущий пароль"
                          value={mainOldPassword}
                          onChange={(e) => setMainOldPassword(e.target.value)}
                          className="text-sm"
                        />
                        <Input
                          type="password"
                          placeholder="Новый пароль"
                          value={mainNewPassword}
                          onChange={(e) => setMainNewPassword(e.target.value)}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleMainPasswordChange}
                          disabled={mainPasswordLoading}
                        >
                          {mainPasswordLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                          Сменить
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Send className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Telegram для сброса пароля</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Напишите боту <code className="bg-muted px-1 rounded">@mb_requests_bot</code> в Telegram любое сообщение,
                        затем нажмите кнопку ниже — бот привяжется к вашему аккаунту.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleLinkMainTelegram}
                        disabled={linking}
                      >
                        {linking ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                        Привязать Telegram
                      </Button>
                    </div>
                  )}
                </div>
              )
              })}
            </div>
          )}
          <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground space-y-1">
            <p className="font-semibold">Как привязать Telegram:</p>
            <p>1. Участник открывает бота <code className="bg-muted px-1 rounded">@mb_requests_bot</code> в Telegram</p>
            <p>2. Отправляет любое сообщение (например /start)</p>
            <p>3. Админ нажимает «Привязать Telegram» — chat_id сохранится</p>
            <p>4. Теперь при сбросе пароля ссылка придёт этому участнику в Telegram</p>
          </div>
        </CardContent>
      </Card>

      {/* Telegram webhook настройка */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Telegram бот
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Бот <strong>@mb_requests_bot</strong> обрабатывает запросы сброса пароля.
            Для работы нужно один раз зарегистрировать webhook.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setWebhookLoading(true)
                try {
                  const res = await fetch('/api/telegram-setup', { method: 'GET' })
                  const data = await res.json()
                  if (data.ok) {
                    setWebhookInfo(data.webhook)
                    if (data.webhook?.url) {
                      toast.success('Webhook активен: ' + data.webhook.url)
                    } else {
                      toast.info('Webhook не зарегистрирован')
                    }
                  } else {
                    toast.error(data.error || 'Ошибка')
                  }
                } catch (e: any) {
                  toast.error(e?.message || 'Ошибка')
                } finally {
                  setWebhookLoading(false)
                }
              }}
              disabled={webhookLoading}
            >
              {webhookLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Проверить статус
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={async () => {
                setWebhookLoading(true)
                try {
                  const res = await fetch('/api/telegram-setup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                  })
                  const data = await res.json()
                  if (data.ok) {
                    setWebhookInfo(data.info)
                    toast.success('Webhook зарегистрирован: ' + data.webhookUrl)
                  } else {
                    toast.error(data.error || 'Ошибка регистрации')
                  }
                } catch (e: any) {
                  toast.error(e?.message || 'Ошибка')
                } finally {
                  setWebhookLoading(false)
                }
              }}
              disabled={webhookLoading}
            >
              {webhookLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Зарегистрировать webhook
            </Button>
          </div>
          {webhookInfo && (
            <div className="text-xs space-y-1 p-3 bg-muted/30 rounded-lg">
              <p><strong>URL:</strong> {webhookInfo.url || 'не установлен'}</p>
              <p><strong>Pending updates:</strong> {webhookInfo.pending_update_count || 0}</p>
              {webhookInfo.last_error_message && (
                <p className="text-destructive"><strong>Ошибка:</strong> {webhookInfo.last_error_message}</p>
              )}
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-semibold">Как работает сброс пароля:</p>
            <p>1. Пользователь нажимает «Забыли пароль?» и вводит телефон</p>
            <p>2. Сайт перенаправляет его в чат с ботом @mb_requests_bot</p>
            <p>3. Пользователь нажимает «Start» в Telegram</p>
            <p>4. Бот присылает ссылку для сброса пароля</p>
            <p>5. Пользователь переходит по ссылке и вводит новый пароль</p>
          </div>
        </CardContent>
      </Card>

      {/* Сессия */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Сессия
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Вы вошли как администратор. Сессия действует 7 дней.
          </p>
          <Button variant="destructive" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Выход...
              </>
            ) : (
              'Выйти из админки'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Диалог добавления */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый участник</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="member-name">Имя</Label>
              <Input
                id="member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-phone">Телефон</Label>
              <Input
                id="member-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 700 123 45 67"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-password">Пароль</Label>
              <Input
                id="member-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 4 символа"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={saving}>Отмена</Button>
            </DialogClose>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить участника?</DialogTitle>
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
