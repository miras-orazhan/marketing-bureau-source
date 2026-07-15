import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { adminListFaq, adminCreateFaq, type FaqInput } from '@/lib/company-content'

export async function GET() {
  const ok = await isAdmin()
  if (ok) {
    const items = await adminListFaq()
    return NextResponse.json({ items })
  }
  return NextResponse.json({ items: [] })
}

export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const input = (await req.json().catch(() => ({}))) as FaqInput
    if (!input.question?.trim()) {
      return NextResponse.json({ ok: false, error: 'Вопрос обязателен' }, { status: 400 })
    }
    if (!input.answer?.trim()) {
      return NextResponse.json({ ok: false, error: 'Ответ обязателен' }, { status: 400 })
    }
    const row = await adminCreateFaq(input)
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Ошибка' }, { status: 500 })
  }
}
