import { db } from '@/lib/db'
import type { SiteSettingsPublic } from '@/lib/settings'

/**
 * Schema.org JSON-LD генераторы.
 * Все schema собираются здесь, чтобы переиспользовать на разных страницах.
 *
 * Типы:
 *   - Organization / ProfessionalService — на главной (GEO)
 *   - WebSite — на главной (SearchAction)
 *   - BreadcrumbList — на всех страницах
 *   - Service — на странице услуги
 *   - FAQPage — на странице FAQ (AEO)
 *   - Article — на странице статьи
 *   - LocalBusiness — расширяет Organization с NAP (GEO)
 */

type SchemasContext = {
  settings: SiteSettingsPublic
  pageSlug: string
  pageUrl: string
}

/**
 * Полный schema.org для текущей страницы.
 * Возвращает массив JSON-LD объектов, которые рендерятся как <script> теги.
 */
export async function getPageSchemas(ctx: SchemasContext): Promise<string[]> {
  const { settings, pageSlug, pageUrl } = ctx
  const baseUrl = (settings.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')
  const schemas: any[] = []

  // 1. Organization / LocalBusiness — на всех страницах (GEO)
  schemas.push(buildOrganizationSchema(settings, baseUrl))

  // 2. WebSite с SearchAction — на главной
  if (pageSlug === 'home') {
    schemas.push(buildWebSiteSchema(settings, baseUrl))
  }

  // 3. BreadcrumbList — на всех страницах кроме home
  if (pageSlug !== 'home') {
    schemas.push(buildBreadcrumbSchema(pageSlug, pageUrl, settings, baseUrl))
  }

  // 4. FAQPage — на странице FAQ (AEO — featured snippets)
  if (pageSlug === 'faq') {
    const faqs = await db.faqItem.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (faqs.length > 0) {
      schemas.push(buildFaqSchema(faqs))
    }
  }

  // 5. Article — на странице статьи (AEO)
  if (pageSlug === 'blog' || pageSlug === 'article') {
    // Article schema рендерится отдельно в page.tsx при просмотре статьи
  }

  // 6. Service — на странице услуг (SEO)
  if (pageSlug === 'services') {
    const services = await db.service.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (services.length > 0) {
      schemas.push(buildItemListSchema(services, settings, baseUrl, 'Услуги', 'Service'))
    }
  }

  // 7. Кейсы —ItemList
  if (pageSlug === 'cases') {
    const cases = await db.caseItem.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    })
    if (cases.length > 0) {
      schemas.push(buildItemListSchema(cases, settings, baseUrl, 'Кейсы', 'CreativeWork'))
    }
  }

  return schemas.map((s) => JSON.stringify(s, null, 2))
}

// ───────────────────────────────────────────────
// Organization / LocalBusiness (GEO)
// ───────────────────────────────────────────────

function buildOrganizationSchema(s: SiteSettingsPublic, baseUrl: string) {
  const sameAs = [
    s.facebook,
    s.twitter,
    s.instagram,
    s.youtube,
    s.telegram,
  ].filter(Boolean) as string[]

  const org: any = {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    '@id': `${baseUrl}/#organization`,
    name: s.siteName,
    alternateName: s.logoText || undefined,
    url: baseUrl,
    logo: s.logoUrl ? (s.logoUrl.startsWith('http') ? s.logoUrl : `${baseUrl}${s.logoUrl}`) : undefined,
    image: s.ogImage ? (s.ogImage.startsWith('http') ? s.ogImage : `${baseUrl}${s.ogImage}`) : undefined,
    description: s.metaDescription,
    email: s.email,
    telephone: s.phone,
    address: s.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: s.address,
          addressLocality: 'Алматы',
          addressRegion: 'Алматинская область',
          addressCountry: 'KZ',
        }
      : undefined,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 43.222,
      longitude: 76.8512,
    },
    areaServed: [
      { '@type': 'Country', name: 'Казахстан' },
      { '@type': 'City', name: 'Алматы' },
    ],
    serviceType: 'Маркетинговые услуги',
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }

  // Очищаем undefined
  Object.keys(org).forEach((k) => org[k] === undefined && delete org[k])
  return org
}

// ───────────────────────────────────────────────
// WebSite с SearchAction (SEO — sitelinks search)
// ───────────────────────────────────────────────

function buildWebSiteSchema(s: SiteSettingsPublic, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    url: baseUrl,
    name: s.siteName,
    description: s.metaDescription,
    inLanguage: 'ru',
    publisher: { '@id': `${baseUrl}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// ───────────────────────────────────────────────
// BreadcrumbList (SEO)
// ───────────────────────────────────────────────

function buildBreadcrumbSchema(
  pageSlug: string,
  pageUrl: string,
  s: SiteSettingsPublic,
  baseUrl: string
) {
  const labels: Record<string, string> = {
    services: 'Услуги',
    cases: 'Кейсы',
    about: 'О нас',
    faq: 'FAQ',
    blog: 'Блог',
    privacy: 'Политика конфиденциальности',
    article: 'Статья',
  }

  const items: any[] = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Главная',
      item: `${baseUrl}/`,
    },
  ]

  if (pageSlug !== 'home') {
    items.push({
      '@type': 'ListItem',
      position: 2,
      name: labels[pageSlug] || pageSlug,
      item: pageUrl,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

// ───────────────────────────────────────────────
// FAQPage (AEO — featured snippets)
// ───────────────────────────────────────────────

function buildFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}

// ───────────────────────────────────────────────
// ItemList (Service / CreativeWork)
// ───────────────────────────────────────────────

function buildItemListSchema(
  items: { title: string; slug: string; excerpt?: string | null; content?: string | null }[],
  s: SiteSettingsPublic,
  baseUrl: string,
  listName: string,
  itemType: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': itemType,
        name: item.title,
        description: item.excerpt || undefined,
        url: `${baseUrl}/?section=${listName.toLowerCase() === 'услуги' ? 'services' : 'cases'}&item=${item.slug}`,
        provider: { '@id': `${baseUrl}/#organization` },
      },
    })),
  }
}

// ───────────────────────────────────────────────
// Article (AEO)
// ───────────────────────────────────────────────

export function buildArticleSchema(
  article: {
    title: string
    slug: string
    excerpt: string | null
    content: string
    author: string | null
    publishedAt: Date | null
    updatedAt: Date
    type: string
  },
  s: SiteSettingsPublic,
  baseUrl: string
) {
  // Очищаем HTML от тегов для description
  const textContent = article.content.replace(/<[^>]*>/g, '').slice(0, 300)
  const description = article.excerpt || textContent

  return {
    '@context': 'https://schema.org',
    '@type': article.type === 'NEWS' ? 'NewsArticle' : 'Article',
    headline: article.title,
    description,
    image: s.ogImage ? (s.ogImage.startsWith('http') ? s.ogImage : `${baseUrl}${s.ogImage}`) : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Organization',
      name: article.author || s.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: s.siteName,
      logo: {
        '@type': 'ImageObject',
        url: s.logoUrl ? (s.logoUrl.startsWith('http') ? s.logoUrl : `${baseUrl}${s.logoUrl}`) : `${baseUrl}/logo.svg`,
      },
    },
    inLanguage: 'ru',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/?article=${article.slug}`,
    },
  }
}

// ───────────────────────────────────────────────
// SpeakableSpecification (AEO — voice search)
// ───────────────────────────────────────────────

export function buildSpeakableSchema(baseUrl: string, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: pageUrl,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.speakable'],
    },
  }
}
