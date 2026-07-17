import { getPublishedSocialLinks } from '@/lib/company-content'
import { cachedJson } from '@/lib/api-cache'

/**
 * GET /api/public/social-links
 * Публичный список опубликованных соцсетей (для футера и шапки).
 * Кешируется на 1 час — соцсети меняются редко.
 */
export async function GET() {
  const items = await getPublishedSocialLinks()
  return cachedJson({ items }, 3600)
}
