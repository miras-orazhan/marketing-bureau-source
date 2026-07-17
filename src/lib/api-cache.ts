import { NextResponse } from 'next/server'

/**
 * Утилиты для управления HTTP-кэшированием публичных API-роутов.
 *
 * В Next.js App Router каждый GET-роут может указать Cache-Control через
 * headers конфигурации или напрямую в NextResponse. Здесь — общий helper,
 * чтобы кешировать «тяжёлые» публичные данные (списки кейсов, услуг, FAQ и т.д.)
 * на короткий срок — это радикально ускоряет повторные запросы.
 *
 * Использование:
 *   import { cachedJson } from '@/lib/api-cache'
 *   export async function GET() {
 *     const items = await getPublishedCases()
 *     return cachedJson({ items }, 60)  // кеш на 60 секунд
 *   }
 *
 * Рекомендуемые значения:
 *   - 60 сек — для часто меняющихся данных (кейсы, статьи)
 *   - 300 сек — для редкоменяющихся (услуги, FAQ)
 *   - 3600 сек — для почти статичных (соцсети, настройки)
 */

/**
 * Возвращает JSON-ответ с заголовком Cache-Control.
 *
 * @param data — данные для сериализации в JSON
 * @param maxAge — время жизни кеша в секундах (по умолчанию 60)
 * @param sMaxAge — время жизни кеша на CDN (Vercel Edge), по умолчанию = maxAge
 */
export function cachedJson<T>(data: T, maxAge: number = 60, sMaxAge?: number): NextResponse {
  const smax = sMaxAge ?? maxAge
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${smax}, stale-while-revalidate=300`,
    },
  })
}

/**
 * Заголовки для ручной установки (если нужно комбинировать с другими).
 */
export const cacheHeaders = (maxAge: number = 60, sMaxAge?: number) => ({
  'Cache-Control': `public, max-age=${maxAge}, s-maxage=${sMaxAge ?? maxAge}, stale-while-revalidate=300`,
})
