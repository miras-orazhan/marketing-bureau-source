import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { changeAdminPassword } from '@/lib/settings'

/**
 * POST /api/change-password
 * Body: { oldPassword, newPassword }
 */
export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const oldP = typeof body?.oldPassword === 'string' ? body.oldPassword : ''
    const newP = typeof body?.newPassword === 'string' ? body.newPassword : ''
    if (!oldP || !newP) {
      return NextResponse.json({ ok: false, error: 'Заполните все поля' }, { status: 400 })
    }
    if (newP.length < 4) {
      return NextResponse.json({ ok: false, error: 'Минимум 4 символа' }, { status: 400 })
    }
    const success = await changeAdminPassword(oldP, newP)
    if (!success) {
      return NextResponse.json({ ok: false, error: 'Старый пароль неверен' }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Ошибка' },
      { status: 500 }
    )
  }
}
