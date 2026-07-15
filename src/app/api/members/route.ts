import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { listMembers, createMember, type AdminMemberInput } from '@/lib/admin-members'

export async function GET() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const items = await listMembers()
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const input = (await req.json().catch(() => ({}))) as AdminMemberInput
    const member = await createMember(input)
    return NextResponse.json({ ok: true, id: member.id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Ошибка' }, { status: 500 })
  }
}
