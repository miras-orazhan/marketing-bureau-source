import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'

/**
 * GET /api/session — возвращает { isAdmin: boolean }.
 * Используется клиентом для проверки авторизации без server action.
 */
export async function GET() {
  const ok = await isAdmin()
  return NextResponse.json({ isAdmin: ok })
}
