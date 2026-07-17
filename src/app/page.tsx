import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SiteApp } from '@/components/site/site-app'
import { getSiteSettings } from '@/lib/settings'
import {
  getPublishedArticles,
  getArticleBySlug,
  getFeaturedArticle,
} from '@/lib/articles'
import {
  getPublishedServices,
  getPublishedCases,
  getPublishedFaq,
  getPublishedExpertise,
  getPublishedWhyUs,
  getPublishedSocialLinks,
  getPublishedCaseBySlug,
  getRelatedCases,
} from '@/lib/company-content'
import { getPrivacyContent } from '@/lib/privacy'
import { getEffectivePageMeta, type PageSlug, ALL_PAGE_SLUGS } from '@/lib/page-meta'
import { isAdmin } from '@/lib/auth'
import { getPageSchemas, buildArticleSchema } from '@/lib/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type SearchParams = Promise<{
  view?: string
  article?: string
  case?: string
  section?: string
  tab?: string
  token?: string
}>

function resolvePageSlug(params: {
  view?: string
  article?: string
  case?: string
  section?: string
} | undefined | null): PageSlug {
  if (!params) return 'home'
  if (params.view === 'admin') return 'home'
  if (params.article) return 'blog'
  if (params.case) return 'cases'
  if (params.section) {
    const s = params.section as PageSlug
    if ((ALL_PAGE_SLUGS as string[]).includes(s)) return s
  }
  return 'home'
}

/**
 * Постраничные SEO-метаданные.
 * Переопределяет базовые из layout.tsx.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const params = await searchParams
  const s = await getSiteSettings()
  const pageSlug = resolvePageSlug(params)
  const meta = await getEffectivePageMeta(pageSlug, {
    siteName: s.siteName,
    siteUrl: s.siteUrl,
    ogImage: s.ogImage,
    email: s.email,
    phone: s.phone,
  })

  // Для детальной страницы кейса — переопределяем метаданные из самого кейса
  let caseTitle: string | null = null
  let caseExcerpt: string | null = null
  let caseCover: string | null = null
  let caseClient: string | null = null
  if (params.case) {
    const c = await getPublishedCaseBySlug(params.case)
    if (c) {
      caseTitle = c.title
      caseExcerpt = c.excerpt
      caseCover = c.coverImage
      caseClient = c.client
    }
  }

  const title = caseTitle
    ? `${caseTitle} — кейс${caseClient ? ` ${caseClient}` : ''} — ${s.siteName}`
    : meta.title
  const description = caseExcerpt || meta.description
  const keywords = meta.keywords
    ? meta.keywords.split(',').map((t) => t.trim()).filter(Boolean)
    : undefined

  const indexable = s.robotsIndex && meta.robotsIndex
  const baseUrl = (s.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')

  // Canonical URL — всегда абсолютный, на текущую страницу
  let canonicalPath = '/'
  if (params.article) canonicalPath = `/?article=${params.article}`
  else if (params.case) canonicalPath = `/?case=${params.case}`
  else if (params.section) canonicalPath = `/?section=${params.section}`
  const canonical = meta.canonicalUrl || `${baseUrl}${canonicalPath}`

  // OG image: для кейса — его обложка, иначе дефолт
  const ogImage = caseCover || meta.ogImage

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: caseTitle || meta.ogTitle,
      description: caseExcerpt || meta.ogDescription,
      url: canonical,
      siteName: s.siteName,
      type: s.ogType as any,
      locale: 'ru_KZ',
      images: ogImage
        ? [
            {
              url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: s.twitterCard as any,
      title: caseTitle || meta.twitterTitle,
      description: caseExcerpt || meta.twitterDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: indexable,
      follow: indexable,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: { canonical },
    other: {
      // GEO-мета (локальное SEO для Казахстана)
      'geo.region': 'KZ',
      'geo.placename': 'Алматы',
      'geo.position': '43.222;76.8512',
      ICBM: '43.222, 76.8512',
      // Язык
      language: 'Russian',
      // Author
      author: s.siteName,
      // Рейтинг
      rating: 'general',
      // OG image alt
      'og:image:alt': title,
      // AI crawlers hint
      'ai-content': 'allowed',
    },
  }
}

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  // Редирект старых URL вида /?case=<slug> на новые /cases/<slug>
  // (для SEO и обратной совместимости со старыми ссылками).
  // searchParams приходят уже декодированными Next.js, но на всякий случай
  // кодируем slug для безопасного использования в path.
  if (params.case) {
    const safeSlug = encodeURIComponent(params.case)
    redirect(`/cases/${safeSlug}`)
  }

  const pageSlug = resolvePageSlug(params)

  // ПАРАЛЛЕЛЬНЫЙ ЗАПУСК ВСЕХ ЗАПРОСОВ К БД:
  // Раньше было 4 последовательных await (settings → admin → pageMeta → Promise.all),
  // каждый ~50-100мс = 200-400мс чистого ожидания. Теперь один Promise.all — все
  // запросы идут параллельно, общее время = max(время запроса), а не сумма.
  const [settings, admin, featured, articles, news, services, cases, faq, expertise, whyUs, privacyContent, socialLinks] = await Promise.all([
    getSiteSettings(),
    isAdmin(),
    getFeaturedArticle(),
    getPublishedArticles('ARTICLE', { limit: 12 }),
    getPublishedArticles('NEWS', { limit: 12 }),
    getPublishedServices(),
    getPublishedCases(),
    getPublishedFaq(),
    getPublishedExpertise(),
    getPublishedWhyUs(),
    getPrivacyContent(),
    getPublishedSocialLinks(),
  ])

  // pageMeta и articleData зависят от settings и params — отдельным Promise.all
  const [pageMeta, articleData] = await Promise.all([
    getEffectivePageMeta(pageSlug, {
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      ogImage: settings.ogImage,
      email: settings.email,
      phone: settings.phone,
    }),
    params.article ? getArticleBySlug(params.article, true) : Promise.resolve(null),
  ])

  // Похожие материалы и schema — параллельно
  const [related, extraSchemas] = await Promise.all([
    articleData
      ? getPublishedArticles(articleData.type as 'ARTICLE' | 'NEWS', { limit: 4 })
          .then((r) => r.filter((x) => x.id !== articleData!.id).slice(0, 3))
      : Promise.resolve([]),
    getPageSchemas({
      settings,
      pageSlug: articleData ? 'article' : pageSlug,
      pageUrl: articleData
        ? `${(settings.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')}/?article=${articleData.slug}`
        : `${(settings.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')}/${pageSlug === 'home' ? '' : `?section=${pageSlug}`}`,
    }),
  ])

  // На этой странице кейс уже не загружаем — для /cases/<slug> есть отдельный роут.
  // Старый код с caseData/relatedCases был мёртвый (после redirect).
  const caseData = null
  const relatedCases: Awaited<ReturnType<typeof getRelatedCases>> = []

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Загрузка...
        </div>
      }
    >
      {/* JSON-LD schema.org — массив схем для текущей страницы */}
      {(() => {
        const baseUrl = (settings.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')
        const pageUrl = `${baseUrl}/${pageSlug === 'home' ? '' : `?section=${pageSlug}`}`
        const schemas = [...(pageMeta.schemaOrg ? [pageMeta.schemaOrg] : [])]
        // Добавляем расширенные schema (Organization, FAQ, Breadcrumb, и т.д.)
        // кроме случая когда статья — там отдельная schema
        if (!articleData) {
          // schemas из getPageSchemas добавятся ниже (async)
        }
        // Если статья — добавляем Article schema
        if (articleData) {
          schemas.push(JSON.stringify(buildArticleSchema(articleData, settings, baseUrl), null, 2))
        }
        return schemas.map((s, i) => (
          <script
            key={`schema-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: s }}
          />
        ))
      })()}

      {/* Дополнительные schema из getPageSchemas (Organization, WebSite, Breadcrumb, FAQ, ItemList) */}
      {extraSchemas.map((s, i) => (
        <script
          key={`extra-schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: s }}
        />
      ))}

      <SiteApp
        settings={settings}
        isAdmin={admin}
        pageMeta={pageMeta}
        initialView={
          params.view === 'admin'
            ? 'admin'
            : params.view === 'reset'
              ? 'reset'
              : params.article
                ? 'article'
                : params.case
                  ? 'case'
                  : params.section
                    ? (params.section as 'services' | 'cases' | 'about' | 'blog' | 'news' | 'faq' | 'privacy')
                    : 'home'
        }
        resetToken={params.token || null}
        articleSlug={params.article || null}
        articleData={articleData}
        related={related}
        featured={featured}
        articles={articles}
        news={news}
        services={services}
        cases={cases}
        faq={faq}
        expertise={expertise}
        whyUs={whyUs}
        privacyContent={privacyContent}
        socialLinks={socialLinks}
        caseSlug={params.case || null}
        caseData={caseData}
        relatedCases={relatedCases}
      />
    </Suspense>
  )
}

