import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import {
  adminListArticles,
  adminCreateArticle,
  type ArticleInput,
} from '@/lib/articles'
import { revalidatePath } from 'next/cache'

/**
 * GET /api/articles?type=ARTICLE|NEWS — список (только для админа).
 */
export async function GET(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const type = url.searchParams.get('type') as 'ARTICLE' | 'NEWS' | null
  const items = await adminListArticles(type || undefined)
  return NextResponse.json({ items })
}

/**
 * POST /api/articles — создать (только для админа).
 * Body: ArticleInput
 */
export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const input = (await req.json().catch(() => ({}))) as ArticleInput
    if (!input.title?.trim()) {
      return NextResponse.json({ ok: false, error: 'Заголовок обязателен' }, { status: 400 })
    }
    const created = await adminCreateArticle(input)
    revalidatePath('/')
    return NextResponse.json({ ok: true, id: created.id })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Ошибка создания' },
      { status: 500 }
    )
  }
}
