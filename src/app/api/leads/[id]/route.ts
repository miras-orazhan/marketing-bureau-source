import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { errorResponse } from '@/lib/api-errors'

type Params = { params: Promise<{ id: string }> }

/** DELETE /api/leads/[id] — удалить заявку (только админ) */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await db.lead.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return errorResponse(e)
  }
}
