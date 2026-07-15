'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SiteSettingsPublic } from '@/lib/settings'
import { apiSubmitLead } from '@/lib/api-client'
import { toast } from 'sonner'

type CtaSectionProps = {
  settings: SiteSettingsPublic
  source?: string
}

function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (!digits.startsWith('7') && digits.length > 0) digits = '7' + digits
  digits = digits.slice(0, 11)
  let result = '+7'
  if (digits.length > 1) result += ' (' + digits.slice(1, 4)
  if (digits.length >= 4) result += ') ' + digits.slice(4, 7)
  if (digits.length >= 7) result += '-' + digits.slice(7, 9)
  if (digits.length >= 9) result += '-' + digits.slice(9, 11)
  return result
}

// Допустимые DEF-коды казахстанских операторов
// Beeline / izi:        705, 706, 771, 776, 777
// Kcell / Activ:        701, 702, 775, 778
// Tele2 / Altel:        700, 707, 708, 747
const KZ_DEF_CODES = new Set([
  '700', '701', '702', '705', '706', '707', '708',
  '747', '771', '775', '776', '777', '778',
])

function isValidPhone(phone: string): boolean {
  return /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone)
}

function isValidKzPhone(phone: string): boolean {
  if (!isValidPhone(phone)) return false
  // извлекаем DEF-код (3 цифры после +7
  const match = phone.match(/^\+7 \((\d{3})\)/)
  if (!match) return false
  return KZ_DEF_CODES.has(match[1])
}

export function CtaSection({ settings, source = 'home-cta' }: CtaSectionProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string; message?: string }>({})
  const [bgFailed, setBgFailed] = useState(false)

  const validate = (): boolean => {
    const newErrors: { name?: string; phone?: string; email?: string; message?: string } = {}
    if (!name.trim()) {
      newErrors.name = 'Введите имя'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Слишком короткое имя'
    }
    if (!phone.trim()) {
      newErrors.phone = 'Введите телефон'
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Введите корректный номер: +7 (XXX) XXX-XX-XX'
    } else if (!isValidKzPhone(phone)) {
      newErrors.phone = 'Поддерживаются только номера казахстанских операторов (Beeline, Kcell/Activ, Tele2/Altel)'
    }
    if (!email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Некорректный email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Проверьте введённые данные')
      return
    }
    setLoading(true)
    try {
      const result = await apiSubmitLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
        source,
      })
      if (result.ok) {
        setSubmitted(true)
        toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
        setName(''); setPhone(''); setEmail(''); setMessage('')
        setErrors({})
      } else if (result.error && /DEF|оператор|казахстан/i.test(result.error)) {
        // Сервер тоже проверил DEF-код — покажем на поле телефона
        setErrors({ phone: result.error })
        toast.error(result.error)
      } else if (result.error && /email/i.test(result.error)) {
        setErrors({ email: result.error })
        toast.error(result.error)
      } else {
        toast.error(result.error || 'Ошибка отправки')
      }
    } finally {
      setLoading(false)
    }
  }

  // Фон: изображение с затемнением, или градиент брендинга
  const showBg = settings.ctaBackground && !bgFailed
  const leftBg = showBg
    ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${settings.ctaBackground}) center/cover no-repeat`
    : `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`

  return (
    <section id="cta" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div
          className="rounded-2xl overflow-hidden max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2"
        >
          {/* Левая часть — текст с фоном */}
          <div
            className="p-8 md:p-12 text-white flex flex-col justify-center"
            style={{ background: leftBg }}
          >
            {showBg && (
               
              <img
                src={settings.ctaBackground!}
                alt="Фон CTA-баннера"
                className="hidden"
                onError={() => setBgFailed(true)}
              />
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {settings.ctaSectionTitle}
            </h2>
            <p className="text-white/90 leading-relaxed mb-6">
              {settings.ctaSectionText}
            </p>
            <ul className="space-y-2 text-sm text-white/85">
              {settings.ctaBullet1 && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {settings.ctaBullet1}
                </li>
              )}
              {settings.ctaBullet2 && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {settings.ctaBullet2}
                </li>
              )}
              {settings.ctaBullet3 && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {settings.ctaBullet3}
                </li>
              )}
            </ul>
          </div>

          {/* Правая часть — форма */}
          <div className="bg-card p-8 md:p-10 flex flex-col justify-center">
            {submitted ? (
              <div className="text-center py-8">
                <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Заявка отправлена!</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Спасибо за обращение. Наш менеджер свяжется с вами в ближайшее время.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Отправить ещё одну
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <div>
                  <Input
                    id="cta-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (errors.name) setErrors({ ...errors, name: undefined })
                    }}
                    placeholder="Имя"
                    required
                    disabled={loading}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'cta-name-error' : undefined}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p id="cta-name-error" className="text-xs text-destructive mt-1" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    id="cta-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(formatPhone(e.target.value))
                      if (errors.phone) setErrors({ ...errors, phone: undefined })
                    }}
                    placeholder="+7 (___) ___-__-__"
                    required
                    disabled={loading}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'cta-phone-error' : undefined}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && (
                    <p id="cta-phone-error" className="text-xs text-destructive mt-1" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    id="cta-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) setErrors({ ...errors, email: undefined })
                    }}
                    placeholder="Email"
                    required
                    disabled={loading}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'cta-email-error' : undefined}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p id="cta-email-error" className="text-xs text-destructive mt-1" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Textarea
                    id="cta-message"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (errors.message) setErrors({ ...errors, message: undefined })
                    }}
                    rows={3}
                    placeholder="Опишите вашу задачу"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading}
                  style={{
                    backgroundColor: settings.accentColor,
                    color: '#fff',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Отправляем...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {settings.ctaButtonText || 'Оставить заявку'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <a
                    href="/?section=privacy"
                    className="underline hover:text-foreground transition-colors"
                  >
                    политикой конфиденциальности
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
