import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getTelegramBotToken } from '@/lib/settings'
import { getTelegramChatId } from '@/lib/telegram'

/**
 * GET /api/telegram-chat-id
 * Возвращает последний chat_id из обновлений Telegram-бота.
 * Используется для привязки участника к Telegram.
 */
export async function GET() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const botToken = await getTelegramBotToken()
  if (!botToken) {
    return NextResponse.json({ ok: false, error: 'Bot token не настроен' }, { status: 500 })
  }

  const chatId = await getTelegramChatId(botToken)
  if (!chatId) {
    return NextResponse.json({
      ok: false,
      error: 'Бот ещё не получал сообщений. Напишите @mb_requests_bot в Telegram.',
    }, { status: 404 })
  }

  return NextResponse.json({ ok: true, chatId })
}
