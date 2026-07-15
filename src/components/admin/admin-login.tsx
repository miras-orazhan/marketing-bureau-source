'use client'

import { useState } from 'react'
import { Lock, LogIn, Loader2, Phone, KeyRound, ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiLogin, apiForgotPassword, apiResetPassword } from '@/lib/api-client'
import { toast } from 'sonner'

type AdminLoginProps = {
  onBack: () => void
  /** Режим: login | forgot | reset */
  mode?: 'login' | 'forgot' | 'reset'
  /** Токен сброса (для режима reset) */
  resetToken?: string
  onSuccess?: () => void
}

export function AdminLogin({ onBack, mode: initialMode = 'login', resetToken, onSuccess }: AdminLoginProps) {
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>(initialMode)

  // Login state
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Forgot state
  const [forgotPhone, setForgotPhone] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotDeepLink, setForgotDeepLink] = useState<string | null>(null)
  const [forgotSentDirectly, setForgotSentDirectly] = useState(false)

  // Reset state
  const [newPassword, setNewPassword] = useState('')
  const [resetDone, setResetDone] = useState(false)

  // ─── LOGIN ─────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !password.trim()) {
      toast.error('Введите телефон и пароль')
      return
    }
    setLoading(true)
    try {
      const result = await apiLogin(phone.trim(), password)
      if (result.ok) {
        toast.success('Добро пожаловать!')
        if (onSuccess) onSuccess()
        else window.location.reload()
      } else {
        toast.error(result.error || 'Ошибка входа')
      }
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  // ─── FORGOT ────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotPhone.trim()) {
      toast.error('Введите номер телефона')
      return
    }
    setLoading(true)
    try {
      const result = await apiForgotPassword(forgotPhone.trim())
      if (result.ok) {
        setForgotSent(true)
        if (result.sent) {
          // Ссылка отправлена напрямую в Telegram
          setForgotSentDirectly(true)
          toast.success(result.message || 'Ссылка отправлена в Telegram')
        } else if (result.deepLink) {
          // Нужно открыть чат с ботом
          setForgotDeepLink(result.deepLink)
          setForgotSentDirectly(false)
          toast.success('Откройте чат с ботом для получения ссылки')
        } else {
          toast.success(result.message || 'Запрос обработан')
        }
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── RESET ─────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      toast.error('Введите новый пароль')
      return
    }
    if (newPassword.length < 4) {
      toast.error('Минимум 4 символа')
      return
    }
    if (!resetToken) {
      toast.error('Токен сброса не найден')
      return
    }
    setLoading(true)
    try {
      const result = await apiResetPassword(resetToken, newPassword)
      if (result.ok) {
        setResetDone(true)
        toast.success('Пароль изменён! Теперь войдите с новым паролем.')
      } else {
        toast.error(result.error || 'Ошибка')
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── RENDER ────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl border shadow-sm p-8 space-y-6">
          {/* LOGIN MODE */}
          {mode === 'login' && (
            <>
              <div className="text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Вход в админку</h1>
                <p className="text-sm text-muted-foreground">
                  Введите телефон и пароль
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 ___ ___ __ __"
                      className="pl-10"
                      autoFocus
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Вход...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Войти
                    </>
                  )}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Забыли пароль?
              </button>

              <Button variant="ghost" size="sm" onClick={onBack} className="w-full">
                ← Вернуться на сайт
              </Button>
            </>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <>
              {forgotSent ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>

                  {forgotSentDirectly ? (
                    <>
                      <h1 className="text-xl font-bold">Ссылка отправлена!</h1>
                      <p className="text-sm text-muted-foreground">
                        Ссылка для сброса пароля отправлена в ваш Telegram.
                        Проверьте сообщения от бота <strong>@mb_requests_bot</strong>.
                      </p>
                    </>
                  ) : forgotDeepLink ? (
                    <>
                      <h1 className="text-xl font-bold">Откройте Telegram</h1>
                      <p className="text-sm text-muted-foreground">
                        Нажмите кнопку ниже, чтобы открыть чат с ботом.
                        В Telegram нажмите <strong>«Start»</strong> — бот пришлёт ссылку для сброса пароля.
                      </p>
                      <a href={forgotDeepLink} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className="w-full" size="lg">
                          <Send className="mr-2 h-4 w-4" />
                          Открыть @mb_requests_bot
                        </Button>
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Не открывается? Найдите бота <strong>@mb_requests_bot</strong> в Telegram вручную.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="text-xl font-bold">Запрос обработан</h1>
                      <p className="text-sm text-muted-foreground">
                        Если номер найден, ссылка для сброса отправлена.
                      </p>
                    </>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setMode('login')
                      setForgotSent(false)
                      setForgotPhone('')
                      setForgotDeepLink(null)
                      setForgotSentDirectly(false)
                    }}
                  >
                    Вернуться к входу
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                      <KeyRound className="h-7 w-7 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold">Сброс пароля</h1>
                    <p className="text-sm text-muted-foreground">
                      Введите ваш номер телефона — ссылка для сброса придёт в Telegram
                    </p>
                  </div>

                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-phone">Телефон</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgot-phone"
                          type="tel"
                          value={forgotPhone}
                          onChange={(e) => setForgotPhone(e.target.value)}
                          placeholder="+7 ___ ___ __ __"
                          className="pl-10"
                          autoFocus
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Отправка...
                        </>
                      ) : (
                        'Отправить ссылку'
                      )}
                    </Button>
                  </form>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode('login')}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                </>
              )}
            </>
          )}

          {/* RESET PASSWORD MODE */}
          {mode === 'reset' && (
            <>
              {resetDone ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h1 className="text-xl font-bold">Пароль изменён!</h1>
                  <p className="text-sm text-muted-foreground">
                    Теперь вы можете войти в админку с новым паролем.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setMode('login')
                      setResetDone(false)
                      setNewPassword('')
                    }}
                  >
                    Войти
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <KeyRound className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">Новый пароль</h1>
                    <p className="text-sm text-muted-foreground">
                      Придумайте новый пароль для входа
                    </p>
                  </div>

                  <form onSubmit={handleReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Новый пароль</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoFocus
                        disabled={loading}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Сохранение...
                        </>
                      ) : (
                        'Установить пароль'
                      )}
                    </Button>
                  </form>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode('login')}
                    className="w-full"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
