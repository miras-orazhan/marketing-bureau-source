import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteApp } from '@/components/site/site-app'
import { getSiteSettings } from '@/lib/settings'
import {
  getPublishedArticles,
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
import { getEffectivePageMeta } from '@/lib/page-meta'
import { isAdmin } from '@/lib/auth'
import { getPageSchemas } from '@/lib/schema'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = Promise<{ slug: string }>

/**
 * SEO-метаданные для детальной страницы кейса.
 * URL: /cases/<slug>
 */
export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug: rawSlug } = await params
  // Next.js может передать slug URL-encoded (для кириллицы) — декодируем
  let slug: string
  try {
    slug = decodeURIComponent(rawSlug)
  } catch {
    slug = rawSlug
  }
  const s = await getSiteSettings()

  // Загружаем кейс для формирования title/description/OG-image
  const c = await getPublishedCaseBySlug(slug)
  if (!c) {
    return {
      title: 'Кейс не найден',
      robots: { index: false, follow: false },
    }
  }

  const caseTitle = c.title
  const caseExcerpt = c.excerpt
  const caseCover = c.coverImage
  const caseClient = c.client

  const title = `${caseTitle} — кейс${caseClient ? ` ${caseClient}` : ''} — ${s.siteName}`
  const description = caseExcerpt || s.metaDescription
  const baseUrl = (s.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')
  const canonical = `${baseUrl}/cases/${encodeURIComponent(slug)}`
  const ogImage = caseCover || s.ogImage

  const indexable = s.robotsIndex

  return {
    title,
    description,
    openGraph: {
      title: caseTitle,
      description: caseExcerpt || s.ogDescription,
      url: canonical,
      siteName: s.siteName,
      type: 'article',
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
      card: 'summary_large_image',
      title: caseTitle,
      description: caseExcerpt || s.twitterDescription,
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
      'geo.region': 'KZ',
      'geo.placename': 'Алматы',
      'geo.position': '43.222;76.8512',
      ICBM: '43.222, 76.8512',
      language: 'Russian',
      author: s.siteName,
      rating: 'general',
      'og:image:alt': title,
      'ai-content': 'allowed',
    },
  }
}

/**
 * GET /cases/<slug> — детальная страница кейса.
 * Чистый URL, индексируется поисковиками.
 */
export default async function CasePage({ params }: { params: Params }) {
  const { slug: rawSlug } = await params
  // Декодируем URL-encoded slug (для кириллицы)
  let slug: string
  try {
    slug = decodeURIComponent(rawSlug)
  } catch {
    slug = rawSlug
  }

  // Загружаем кейс — если не найден или не опубликован → 404
  const caseData = await getPublishedCaseBySlug(slug)
  if (!caseData) {
    notFound()
  }

  // Похожие кейсы
  const relatedCases = await getRelatedCases(caseData.id, 3)

  // Загружаем остальные данные для SiteApp (нужно для Header/Footer)
  const settings = await getSiteSettings()
  const admin = await isAdmin()
  const pageMeta = await getEffectivePageMeta('cases', {
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    ogImage: settings.ogImage,
    email: settings.email,
    phone: settings.phone,
  })

  const [
    featured,
    articles,
    news,
    services,
    cases,
    faq,
    expertise,
    whyUs,
    privacyContent,
    socialLinks,
  ] = await Promise.all([
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

  // Schema.org
  const baseUrl = (settings.siteUrl || 'https://marketingbureau.kz').replace(/\/$/, '')
  const extraSchemas = await getPageSchemas({
    settings,
    pageSlug: 'cases',
    pageUrl: `${baseUrl}/cases/${slug}`,
  })

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Загрузка...
        </div>
      }
    >
      {/* JSON-LD schema.org */}
      {extraSchemas.map((s, i) => (
        <script
          key={`case-schema-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: s }}
        />
      ))}

      <SiteApp
        settings={settings}
        isAdmin={admin}
        pageMeta={pageMeta}
        initialView="case"
        articleSlug={null}
        resetToken={null}
        articleData={null}
        related={[]}
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
        caseSlug={slug}
        caseData={caseData}
        relatedCases={relatedCases}
      />
    </Suspense>
  )
}
