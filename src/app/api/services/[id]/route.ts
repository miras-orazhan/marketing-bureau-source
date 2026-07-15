import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { adminGetService, adminUpdateService, adminDeleteService, type ServiceInput } from '@/lib/company-content'
import { errorResponse } from '@/lib/api-errors'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const item = await adminGetService(id)
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const input = (await req.json().catch(() => ({}))) as Partial<ServiceInput>
    await adminUpdateService(id, input)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return errorResponse(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await adminDeleteService(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return errorResponse(e)
  }
}
