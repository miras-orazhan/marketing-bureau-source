import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /robots.txt
 * Динамический robots.txt — разрешает индексацию, указывает на sitemap.
 */
export async function GET() {
  const settings = await getSiteSettings()
  const baseUrl = (settings.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')

  // Если глобальный флаг robotsIndex=false — закрываем весь сайт
  const disallowAll = !settings.robotsIndex

  const robots = disallowAll
    ? `User-agent: *
Disallow: /

Sitemap: ${baseUrl}/sitemap.xml
`
    : `# robots.txt for ${settings.siteName}
# Generated dynamically

User-agent: *
Allow: /
Disallow: /?view=admin
Disallow: /api/

# AI crawlers — разрешаем (GEO optimization)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: YandexBot
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`

  return new NextResponse(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
