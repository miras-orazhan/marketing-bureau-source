import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { sendTelegramMessage } from '@/lib/telegram'

// Допустимые DEF-коды казахстанских операторов
// Beeline / izi:        705, 706, 771, 776, 777
// Kcell / Activ:        701, 702, 775, 778
// Tele2 / Altel:        700, 707, 708, 747
const KZ_DEF_CODES = new Set([
  '700', '701', '702', '705', '706', '707', '708',
  '747', '771', '775', '776', '777', '778',
])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Извлекает DEF-код (3 цифры после +7) из произвольной строки телефона.
 * Возвращает null, если не удалось.
 */
function extractDefCode(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  // ожидаем 11 цифр, начиная с 7 (мобильный формат KZ)
  if (digits.length !== 11) return null
  if (digits[0] !== '7') return null
  return digits.slice(1, 4)
}

/**
 * POST /api/leads
 * Публичный эндпоинт — принимает заявку с CTA-формы.
 * Сохраняет в БД + отправляет уведомление в Telegram-чат.
 * Body: { name, phone, email, message?, source? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const source = typeof body?.source === 'string' ? body.source.trim() : ''

    if (!name) {
      return NextResponse.json({ ok: false, error: 'Имя обязательно' }, { status: 400 })
    }
    if (!phone) {
      return NextResponse.json({ ok: false, error: 'Телефон обязателен' }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email обязателен' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'Некорректный email' }, { status: 400 })
    }
    if (name.length > 200) {
      return NextResponse.json({ ok: false, error: 'Слишком длинное имя' }, { status: 400 })
    }
    if (phone.length > 50) {
      return NextResponse.json({ ok: false, error: 'Слишком длинный телефон' }, { status: 400 })
    }

    // Проверка DEF-кода казахстанского оператора
    const defCode = extractDefCode(phone)
    if (!defCode) {
      return NextResponse.json(
        { ok: false, error: 'Введите корректный номер в формате +7 (XXX) XXX-XX-XX' },
        { status: 400 }
      )
    }
    if (!KZ_DEF_CODES.has(defCode)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Поддерживаются только номера казахстанских операторов (Beeline, Kcell/Activ, Tele2/Altel)',
        },
        { status: 400 }
      )
    }

    // Сохраняем заявку в БД
    const lead = await db.lead.create({
      data: {
        name,
        phone,
        email: email || null,
        message: message || null,
        source: source || null,
      },
    })

    // Отправляем уведомление в Telegram
    try {
      const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
      const botToken = settings?.telegramBotToken
      const chatId = settings?.telegramLeadsChatId

      if (botToken && chatId) {
        const date = new Date().toLocaleString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Almaty',
        })

        const sourceLabel = source === 'home-cta' ? 'Главная' :
          source === 'services-cta' ? 'Услуги' :
          source === 'cases-cta' ? 'Кейсы (список)' :
          source === 'case-cta' ? 'Кейс (детальная)' :
          source === 'faq-cta' ? 'FAQ' :
          source === 'about-cta' ? 'О нас' :
          source === 'blog-cta' ? 'Блог' :
          source || 'Сайт'

        const tgMessage = `🔔 <b>Новая заявка с сайта!</b>

👤 <b>Имя:</b> ${name}
📞 <b>Телефон:</b> ${phone}${email ? `\n📧 <b>Email:</b> ${email}` : ''}${message ? `\n💬 <b>Сообщение:</b> ${message}` : ''}

📍 <b>Страница:</b> ${sourceLabel}
🕐 <b>Время:</b> ${date}`

        await sendTelegramMessage(botToken, chatId, tgMessage)
      }
    } catch (tgError) {
      // Ошибка Telegram не должна блокировать создание заявки
      console.error('Telegram notification error:', tgError)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Lead create error:', e)
    return NextResponse.json(
      { ok: false, error: e?.message || 'Внутренняя ошибка' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/leads — список заявок (только для админа).
 */
export async function GET() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await db.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  })
  return NextResponse.json({ items })
}
