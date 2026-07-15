import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { adminGetArticle, adminUpdateArticle, adminDeleteArticle, type ArticleInput } from '@/lib/articles'
import { revalidatePath } from 'next/cache'
import { errorResponse } from '@/lib/api-errors'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/articles/[id] — получить один материал.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const article = await adminGetArticle(id)
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(article)
}

/**
 * PUT /api/articles/[id] — обновить.
 */
export async function PUT(req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const input = (await req.json().catch(() => ({}))) as Partial<ArticleInput>
    await adminUpdateArticle(id, input)
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return errorResponse(e)
  }
}

/**
 * DELETE /api/articles/[id] — удалить.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await adminDeleteArticle(id)
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return errorResponse(e)
  }
}
