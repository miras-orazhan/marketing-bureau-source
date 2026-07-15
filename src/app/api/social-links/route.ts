import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { adminListSocialLinks, adminCreateSocialLink, type SocialLinkInput } from '@/lib/company-content'

export async function GET() {
  const ok = await isAdmin()
  if (ok) {
    const items = await adminListSocialLinks()
    return NextResponse.json({ items })
  }
  return NextResponse.json({ items: [] })
}

export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const input = (await req.json().catch(() => ({}))) as SocialLinkInput
    if (!input.name?.trim()) {
      return NextResponse.json({ ok: false, error: 'Название обязательно' }, { status: 400 })
    }
    if (!input.url?.trim()) {
      return NextResponse.json({ ok: false, error: 'URL обязателен' }, { status: 400 })
    }
    const row = await adminCreateSocialLink(input)
    return NextResponse.json({ ok: true, id: row.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Ошибка' }, { status: 500 })
  }
}
