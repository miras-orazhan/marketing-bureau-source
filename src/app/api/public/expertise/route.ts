import { NextRequest } from 'next/server'
import { getPublishedExpertise } from '@/lib/company-content'
import { cachedJson } from '@/lib/api-cache'

/**
 * GET /api/public/expertise?limit=4
 * Публичный список опубликованных экспертиз.
 * Кешируется на 5 минут — экспертиза меняется нечасто.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limitStr = url.searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr, 10) : undefined
  const items = await getPublishedExpertise(limit)
  return cachedJson({ items }, 300)
}
