import { NextResponse } from 'next/server'
import { getPublishedSocialLinks } from '@/lib/company-content'

/**
 * GET /api/public/social-links
 * Публичный список опубликованных соцсетей (для футера и шапки).
 */
export async function GET() {
  const items = await getPublishedSocialLinks()
  return NextResponse.json({ items })
}
