import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { adminListCases, adminCreateCase, type CaseInput } from '@/lib/company-content'

export async function GET() {
  const ok = await isAdmin()
  if (ok) {
    const items = await adminListCases()
    return NextResponse.json({ items })
  }
  return NextResponse.json({ items: [] })
}

export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const input = (await req.json().catch(() => ({}))) as CaseInput
    if (!input.title?.trim()) {
      return NextResponse.json({ ok: false, error: 'Заголовок обязателен' }, { status: 400 })
    }
    const row = await adminCreateCase(input)
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Ошибка' }, { status: 500 })
  }
}
