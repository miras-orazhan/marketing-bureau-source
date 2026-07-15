import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import {
  adminListServices,
  adminCreateService,
  type ServiceInput,
} from '@/lib/company-content'

/** GET /api/services — список (админ видит все, гости только опубликованные) */
export async function GET() {
  const ok = await isAdmin()
  if (ok) {
    const items = await adminListServices()
    return NextResponse.json({ items })
  }
  // Гостям не показываем здесь — публичные данные тянутся SSR из БД напрямую.
  return NextResponse.json({ items: [] })
}

/** POST /api/services — создать (только админ) */
export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const input = (await req.json().catch(() => ({}))) as ServiceInput
    if (!input.title?.trim()) {
      return NextResponse.json({ ok: false, error: 'Заголовок обязателен' }, { status: 400 })
    }
    const row = await adminCreateService(input)
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Ошибка' }, { status: 500 })
  }
}
