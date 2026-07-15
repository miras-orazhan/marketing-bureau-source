import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { adminGetStats } from '@/lib/articles'

export async function GET() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const stats = await adminGetStats()
  return NextResponse.json(stats)
}
