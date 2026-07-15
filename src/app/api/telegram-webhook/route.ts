import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTelegramBotToken } from '@/lib/settings'
import { sendTelegramMessage } from '@/lib/telegram'

/**
 * POST /api/telegram-webhook
 * Webhook для приёма сообщений от Telegram Bot.
 *
 * Когда пользователь отправляет /start TOKEN боту,
 * webhook находит токен в БД и отправляет ссылку сброса пароля.
 * Ссылка формируется из siteUrl из БД (не из req.nextUrl, т.к. в webhook
 * контексте host = localhost).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = body?.message
    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat?.id || '')
    const text = String(message.text || '')

    // Получаем siteUrl из настроек
    const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
    const baseUrl = (settings?.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')
    const botToken = settings?.telegramBotToken || ''

    // Проверяем, это команда /start с токеном
    if (text.startsWith('/start ')) {
      const token = text.replace('/start ', '').trim()
      if (!token) {
        await sendTelegramMessage(
          botToken,
          chatId,
          'Привет! Я бот для сброса пароля. Чтобы сбросить пароль, запросите сброс на сайте.'
        )
        return NextResponse.json({ ok: true })
      }

      const resetLink = `${baseUrl}/?view=reset&token=${token}`

      // Ищем токен в SiteSettings (главный админ)
      if (settings?.passwordResetToken && settings.passwordResetToken === token) {
        if (settings.passwordResetExpires && new Date() < settings.passwordResetExpires) {
          await sendTelegramMessage(
            botToken,
            chatId,
            `🔐 <b>Сброс пароля</b>\n\n🔗 <a href="${resetLink}">Нажмите здесь, чтобы установить новый пароль</a>\n\n⏱ Ссылка действительна 30 минут.`
          )
          return NextResponse.json({ ok: true })
        }
      }

      // Ищем токен в AdminMember
      const member = await db.adminMember.findFirst({
        where: { passwordResetToken: token },
      })
      if (member) {
        if (member.passwordResetExpires && new Date() < member.passwordResetExpires) {
          // Сохраняем chat_id
          await db.adminMember.update({
            where: { id: member.id },
            data: { telegramChatId: chatId },
          })
          await sendTelegramMessage(
            botToken,
            chatId,
            `🔐 <b>Сброс пароля</b>\n\nПривет, ${member.name}!\n\n🔗 <a href="${resetLink}">Нажмите здесь, чтобы установить новый пароль</a>\n\n⏱ Ссылка действительна 30 минут.`
          )
          return NextResponse.json({ ok: true })
        }
      }

      // Токен не найден или истёк
      await sendTelegramMessage(
        botToken,
        chatId,
        '❌ Ссылка недействительна или истекла. Запросите сброс пароля заново на сайте.'
      )
      return NextResponse.json({ ok: true })
    }

    // Любое другое сообщение — показываем подсказку
    if (text === '/start' || text) {
      await sendTelegramMessage(
        botToken,
        chatId,
        '🤖 Я бот для сброса пароля админ-панели.\n\nЧтобы сбросить пароль:\n1. Откройте сайт и нажмите «Забыли пароль?»\n2. Введите ваш телефон\n3. Вы будете перенаправлены сюда — нажмите Start'
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Telegram webhook error:', e)
    return NextResponse.json({ ok: true })
  }
}
