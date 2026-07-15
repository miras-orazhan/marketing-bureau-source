import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordWithTokenUniversal } from '@/lib/admin-members'

/**
 * POST /api/reset-password
 * Body: { token, newPassword }
 * Проверяет токен (по участникам и главному админу) и устанавливает новый пароль.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!token || !newPassword) {
      return NextResponse.json(
        { ok: false, error: 'Токен и новый пароль обязательны' },
        { status: 400 }
      )
    }

    if (newPassword.length < 4) {
      return NextResponse.json(
        { ok: false, error: 'Минимум 4 символа в пароле' },
        { status: 400 }
      )
    }

    const ok = await resetPasswordWithTokenUniversal(token, newPassword)
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: 'Ссылка недействительна или истекла. Запросите новую.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Reset password error:', e)
    return NextResponse.json(
      { ok: false, error: e?.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
