import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getRawSiteSettings, updateSiteSettings, type SiteSettingsUpdate } from '@/lib/settings'
import { revalidatePath } from 'next/cache'

/**
 * GET /api/settings — возвращает сырые настройки (только для админа).
 */
export async function GET() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await getRawSiteSettings()
  return NextResponse.json(data)
}

/**
 * PUT /api/settings — обновляет настройки (только для админа).
 * Body: SiteSettingsUpdate (partial)
 */
export async function PUT(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = (await req.json().catch(() => ({}))) as SiteSettingsUpdate
    await updateSiteSettings(data)
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Ошибка сохранения' },
      { status: 500 }
    )
  }
}
