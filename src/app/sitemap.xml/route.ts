import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSiteSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /sitemap.xml
 * Динамический sitemap — генерируется из БД.
 */
export async function GET() {
  const settings = await getSiteSettings()
  const baseUrl = (settings.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')
  const now = new Date().toISOString()

  const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = []

  // Главная
  urls.push({ loc: `${baseUrl}/`, lastmod: now, changefreq: 'weekly', priority: '1.0' })

  // Статические страницы
  const staticPages = [
    { path: '/?section=services', priority: '0.9', changefreq: 'monthly' },
    { path: '/?section=cases', priority: '0.8', changefreq: 'weekly' },
    { path: '/?section=about', priority: '0.7', changefreq: 'monthly' },
    { path: '/?section=faq', priority: '0.7', changefreq: 'monthly' },
    { path: '/?section=blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/?section=privacy', priority: '0.3', changefreq: 'yearly' },
  ]
  staticPages.forEach((p) => {
    urls.push({ loc: `${baseUrl}${p.path}`, lastmod: now, changefreq: p.changefreq, priority: p.priority })
  })

  // Статьи и новости
  const articles = await db.article.findMany({ where: { published: true }, orderBy: { publishedAt: 'desc' } })
  articles.forEach((a) => {
    urls.push({ loc: `${baseUrl}/?article=${a.slug}`, lastmod: a.updatedAt.toISOString(), changefreq: 'monthly', priority: '0.6' })
  })

  // Кейсы
  const cases = await db.caseItem.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } })
  cases.forEach((c) => {
    urls.push({ loc: `${baseUrl}/?section=cases&case=${c.slug}`, lastmod: c.updatedAt.toISOString(), changefreq: 'monthly', priority: '0.6' })
  })

  // Услуги
  const services = await db.service.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } })
  services.forEach((s) => {
    urls.push({ loc: `${baseUrl}/?section=services&service=${s.slug}`, lastmod: s.updatedAt.toISOString(), changefreq: 'monthly', priority: '0.7' })
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
