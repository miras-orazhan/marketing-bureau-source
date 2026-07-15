import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { getAllRawPageMeta, updatePageMeta, ALL_PAGE_SLUGS, PAGE_LABELS, type PageSlug } from '@/lib/page-meta'
import { getRawSiteSettings } from '@/lib/settings'
import { revalidatePath } from 'next/cache'

function isPageSlug(s: string): s is PageSlug {
  return (ALL_PAGE_SLUGS as string[]).includes(s)
}

/**
 * GET /api/page-meta — список всех страниц с их метаданными (только для админа).
 */
export async function GET() {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const settings = await getRawSiteSettings()
  const items = await getAllRawPageMeta({
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    ogImage: settings.ogImage,
  })
  // Добавляем человеко-читаемые лейблы
  const withLabels = items.map((item) => ({
    ...item,
    label: PAGE_LABELS[item.slug as PageSlug] || item.slug,
  }))
  return NextResponse.json({ items: withLabels })
}

/**
 * PUT /api/page-meta?slug=home — обновить метаданные конкретной страницы.
 * Body: PageMetaUpdate
 */
export async function PUT(req: NextRequest) {
  const ok = await isAdmin()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const slug = url.searchParams.get('slug') || ''
  if (!isPageSlug(slug)) {
    return NextResponse.json({ ok: false, error: 'Неизвестная страница' }, { status: 400 })
  }

  try {
    const data = await req.json().catch(() => ({}))
    await updatePageMeta(slug, data)
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Ошибка сохранения' },
      { status: 500 }
    )
  }
}
