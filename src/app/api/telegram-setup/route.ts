import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getTelegramBotToken } from '@/lib/settings'
import { db } from '@/lib/db'

/**
 * POST /api/telegram-setup
 * Регистрирует webhook в Telegram.
 * Body: { webhookUrl } — публичный URL сайта (например https://marketingbureau.kz)
 *        если не указан — используется siteUrl из настроек
 */
export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const botToken = await getTelegramBotToken()
    if (!botToken) {
      return NextResponse.json({ ok: false, error: 'Bot token не настроен' }, { status: 500 })
    }

    // Получаем URL для webhook
    let webhookUrl = body?.webhookUrl
    if (!webhookUrl) {
      const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
      webhookUrl = settings?.siteUrl || ''
    }
    webhookUrl = webhookUrl.replace(/\/$/, '')
    const fullWebhookUrl = `${webhookUrl}/api/telegram-webhook`

    // Устанавливаем webhook
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullWebhookUrl }),
      }
    )
    const data = await res.json()

    if (!data.ok) {
      return NextResponse.json({ ok: false, error: data.description || 'Ошибка регистрации webhook' }, { status: 500 })
    }

    // Получаем информацию о webhook
    const infoRes = await fetch(
      `https://api.telegram.org/bot${botToken}/getWebhookInfo`
    )
    const info = await infoRes.json()

    return NextResponse.json({
      ok: true,
      webhookUrl: fullWebhookUrl,
      info: info.result,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Ошибка' }, { status: 500 })
  }
}

/**
 * GET /api/telegram-setup — проверить статус webhook
 */
export async function GET() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const botToken = await getTelegramBotToken()
  if (!botToken) {
    return NextResponse.json({ ok: false, error: 'Bot token не настроен' }, { status: 500 })
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
  const data = await res.json()

  return NextResponse.json({
    ok: true,
    webhook: data.result,
    botUsername: '@mb_requests_bot',
  })
}
