import { NextRequest, NextResponse } from 'next/server'
import { getPublishedWhyUs } from '@/lib/company-content'

/**
 * GET /api/public/why-us?limit=4
 * Публичный список опубликованных «почему мы».
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limitStr = url.searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : undefined
  const items = await getPublishedWhyUs(limit)
  return NextResponse.json({ items })
}
