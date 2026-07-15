import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { adminUpdateSocialLink, adminDeleteSocialLink, type SocialLinkInput } from '@/lib/company-content'
import { errorResponse } from '@/lib/api-errors'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const input = (await req.json().catch(() => ({}))) as Partial<SocialLinkInput>
    await adminUpdateSocialLink(id, input)
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
    await adminDeleteSocialLink(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return errorResponse(e)
  }
}
