import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/auth'

/**
 * POST /api/logout — очищает cookie администратора.
 */
export async function POST() {
  await clearAdminCookie()
  return NextResponse.json({ ok: true })
}
