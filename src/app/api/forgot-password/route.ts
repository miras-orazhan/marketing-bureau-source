import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTelegramBotToken } from '@/lib/settings'
import {
  createResetTokenForPhone,
  findUserByPhone,
} from '@/lib/admin-members'
import { sendTelegramMessage } from '@/lib/telegram'

/**
 * POST /api/forgot-password
 * Body: { phone }
 *
 * Flow:
 * 1. Находит участника/админа по телефону
 * 2. Генерирует токен сброса
 * 3. Если у участника есть telegramChatId — отправляет ссылку напрямую
 * 4. Если нет — возвращает deepLink для открытия чата с ботом
 *    Пользователь открывает чат, нажимает Start → бот через webhook отправляет ссылку
 *
 * ВАЖНО: URL для ссылки сброса берётся из siteUrl в БД,
 * а не из req.nextUrl (который даёт localhost).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: 'Введите номер телефона' },
        { status: 400 }
      )
    }

    // Получаем siteUrl из БД (не из req.nextUrl!)
    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
    const baseUrl = (settings?.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')
    const botToken = settings?.telegramBotToken || ''

    // Ищем пользователя по телефону
    const user = await findUserByPhone(phone)

    // Всегда возвращаем одинаковый ответ (защита от перебора)
    if (!user) {
      return NextResponse.json({
        ok: true,
        deepLink: 'https://t.me/mb_requests_bot?start=invalid',
        message: 'Если номер найден, вы будете перенаправлены к боту для сброса пароля.',
      })
    }

    // Генерируем токен сброса
    const resetData = await createResetTokenForPhone(phone)
    if (!resetData) {
      return NextResponse.json({
        ok: true,
        deepLink: 'https://t.me/mb_requests_bot?start=invalid',
        message: 'Если номер найден, вы будете перенаправлены к боту для сброса пароля.',
      })
    }

    // Формируем ссылку сброса с правильным доменом
    const resetLink = `${baseUrl}/?view=reset&token=${resetData.token}`

    // Если у участника есть telegramChatId — отправляем напрямую
    if (resetData.telegramChatId && botToken) {
      const message = `🔐 <b>Сброс пароля</b>\n\n🔗 <a href="${resetLink}">Нажмите здесь, чтобы установить новый пароль</a>\n\n⏱ Ссылка действительна 30 минут.`

      const sent = await sendTelegramMessage(botToken, resetData.telegramChatId, message)
      if (sent) {
        return NextResponse.json({
          ok: true,
          sent: true,
          message: 'Ссылка для сброса отправлена в ваш Telegram.',
        })
      }
    }

    // Если не удалось отправить напрямую — возвращаем deep link
    const deepLink = `https://t.me/mb_requests_bot?start=${resetData.token}`

    return NextResponse.json({
      ok: true,
      deepLink,
      message: 'Откройте чат с ботом и нажмите «Start» — бот пришлёт ссылку для сброса.',
    })
  } catch (e: any) {
    console.error('Forgot password error:', e)
    return NextResponse.json(
      { ok: false, error: e?.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
