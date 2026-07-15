import { NextRequest, NextResponse } from 'next/server'
import { getPublishedExpertise } from '@/lib/company-content'

/**
 * GET /api/public/expertise?limit=4
 * Публичный список опубликованных экспертиз.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limitStr = url.searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : undefined
  const items = await getPublishedExpertise(limit)
  return NextResponse.json({ items })
}
