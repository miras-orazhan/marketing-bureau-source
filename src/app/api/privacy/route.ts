import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getRawPrivacyContent, updatePrivacyContent, type PrivacyContentUpdate } from '@/lib/privacy'
import { revalidatePath } from 'next/cache'

/**
 * GET /api/privacy — возвращает контент политики (публичный).
 */
export async function GET() {
  const ok = await isAdmin()
  if (ok) {
    // Админ видит сырые данные
    const data = await getRawPrivacyContent()
    return NextResponse.json(data)
  }
  // Гости видят публичную версию — но мы отдаём ту же, т.к. политика публична
  const data = await getRawPrivacyContent()
  return NextResponse.json(data)
}

/**
 * PUT /api/privacy — обновить контент (только админ).
 */
export async function PUT(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = (await req.json().catch(() => ({}))) as PrivacyContentUpdate
    await updatePrivacyContent(data)
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Ошибка' },
      { status: 500 }
    )
  }
}
