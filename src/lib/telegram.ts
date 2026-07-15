/**
 * Telegram Bot API helper.
 * Отправляет сообщения через Telegram Bot.
 * Используется для отправки ссылки сброса пароля.
 */

/**
 * Получает chat_id последнего пользователя, который написал боту.
 * Использует getUpdates API.
 */
export async function getTelegramChatId(botToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates?limit=10&offset=-10`,
      { method: 'GET' }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.ok || !Array.isArray(data.result)) return null

    // Ищем последнее сообщение от private чата
    for (let i = data.result.length - 1; i >= 0; i--) {
      const update = data.result[i]
      const chat = update.message?.chat || update.callback_query?.message?.chat
      if (chat && chat.type === 'private') {
        return String(chat.id)
      }
    }
    // Если нет private — берём любой
    for (let i = data.result.length - 1; i >= 0; i--) {
      const update = data.result[i]
      const chat = update.message?.chat || update.callback_query?.message?.chat
      if (chat) return String(chat.id)
    }
    return null
  } catch (e) {
    console.error('Telegram getChatId error:', e)
    return null
  }
}

/**
 * Отправляет текстовое сообщение через Telegram Bot.
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Telegram sendMessage error:', err)
      return false
    }
    return true
  } catch (e) {
    console.error('Telegram sendMessage error:', e)
    return false
  }
}

/**
 * Полный flow: получает chat_id и отправляет сообщение.
 * Возвращает true при успехе.
 */
export async function sendTelegramNotification(
  botToken: string,
  text: string
): Promise<boolean> {
  const chatId = await getTelegramChatId(botToken)
  if (!chatId) {
    console.error('No Telegram chat ID found — bot must receive a message first')
    return false
  }
  return sendTelegramMessage(botToken, chatId, text)
}
