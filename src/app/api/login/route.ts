import { NextRequest, NextResponse } from 'next/server'
import { setAdminCookie } from '@/lib/auth'
import { verifyAnyCredentials } from '@/lib/admin-members'
import { revalidatePath } from 'next/cache'

/**
 * POST /api/login
 * Body: { phone, password }
 * Проверяет телефон + пароль по участникам И главному админу.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    if (!phone || !password) {
      return NextResponse.json(
        { ok: false, error: 'Введите телефон и пароль' },
        { status: 400 }
      )
    }

    const ok = await verifyAnyCredentials(phone, password)
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: 'Неверный телефон или пароль' },
        { status: 401 }
      )
    }

    await setAdminCookie()
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('Login error:', e)
    return NextResponse.json(
      { ok: false, error: e?.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/login — выход (очищает cookie)
 */
export async function DELETE() {
  const { clearAdminCookie } = await import('@/lib/auth')
  await clearAdminCookie()
  return NextResponse.json({ ok: true })
}
