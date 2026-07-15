import { db } from '@/lib/db'

/**
 * Поддерживаемые "страницы" сайта.
 * Каждая страница имеет slug, по которому хранится её PageMeta.
 */
export type PageSlug =
  | 'home'
  | 'services'
  | 'cases'
  | 'about'
  | 'blog'
  | 'article'
  | 'news'
  | 'faq'
  | 'privacy'

export const ALL_PAGE_SLUGS: PageSlug[] = [
  'home',
  'services',
  'cases',
  'about',
  'blog',
  'article',
  'news',
  'faq',
  'privacy',
]

export const PAGE_LABELS: Record<PageSlug, string> = {
  home: 'Главная',
  services: 'Услуги',
  cases: 'Кейсы',
  about: 'О нас',
  blog: 'Блог',
  article: 'Статья (детальная)',
  news: 'Новости',
  faq: 'FAQ',
  privacy: 'Политика конфиденциальности',
}

export type EffectivePageMeta = {
  slug: PageSlug
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  ogImage: string | null
  twitterTitle: string
  twitterDescription: string
  twitterImage: string | null
  robotsIndex: boolean
  canonicalUrl: string | null
  schemaOrg: string | null
}

export type RawPageMeta = {
  id: string
  slug: string
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  robotsIndex: boolean
  canonicalUrl: string | null
  schemaOrg: string | null
  updatedAt: Date
}

/**
 * Базовые шаблоны дефолтных значений для каждой страницы.
 * Используются, когда соответствующее поле не заполнено в БД.
 */
function getPageDefaults(
  slug: PageSlug,
  ctx: { siteName: string; siteUrl: string | null; ogImage: string | null }
): Omit<EffectivePageMeta, 'robotsIndex' | 'canonicalUrl' | 'schemaOrg'> {
  const { siteName, siteUrl, ogImage } = ctx
  const label = PAGE_LABELS[slug]

  // Базовые описания для каждой страницы
  const defaults: Record<
    PageSlug,
    { title: string; description: string; keywords: string }
  > = {
    home: {
      title: `${siteName} — маркетинговое бюро в Алматы`,
      description: `${siteName} — маркетинговое бюро полного цикла. Стратегия, брендинг, performance-маркетинг, SMM, SEO. Превращаем бюджеты в клиентов в Казахстане и СНГ.`,
      keywords: `${siteName}, маркетинговое бюро, маркетинг алматы, реклама алматы, seo алматы, smm казахстан, branding, performance`,
    },
    services: {
      title: `Услуги — ${siteName}`,
      description: `Маркетинговые услуги полного цикла: стратегия, брендинг, performance-реклама, SMM, SEO, контент-маркетинг. Подбираем инструменты под ваши цели.`,
      keywords: `${siteName}, маркетинговые услуги, реклама, seo, smm, брендинг, performance-маркетинг`,
    },
    cases: {
      title: `Кейсы — ${siteName}`,
      description: `Реальные проекты маркетингового бюро: стратегии, рекламные кампании, ребрендинг. Измеримый результат и истории роста клиентов.`,
      keywords: `${siteName}, кейсы, портфолио, проекты, маркетинговые кейсы`,
    },
    about: {
      title: `О нас — ${siteName}`,
      description: `${siteName} — команда маркетологов, стратегов и креаторов. Узнайте о нашем подходе, ценностях и принципах работы с клиентами.`,
      keywords: `${siteName}, о компании, команда маркетологов, маркетинговое агентство`,
    },
    blog: {
      title: `Блог — ${siteName}`,
      description: `Статьи о маркетинге, кейсах и трендах. Делимся опытом работы с клиентами в Казахстане и СНГ.`,
      keywords: `${siteName}, блог, статьи о маркетинге, маркетинг казахстан`,
    },
    article: {
      title: `Статья — ${siteName}`,
      description: `Полезные статьи о маркетинге от ${siteName}. Стратегии, кейсы, тренды и практические советы.`,
      keywords: `${siteName}, статья, маркетинг, советы, кейсы`,
    },
    news: {
      title: `Новости — ${siteName}`,
      description: `Новости маркетингового бюро: события, награды, новые услуги и обновления.`,
      keywords: `${siteName}, новости, события маркетингового бюро`,
    },
    faq: {
      title: `Частые вопросы — ${siteName}`,
      description: `Ответы на популярные вопросы о работе с маркетинговым бюро: процессы, оплата, сроки, отчётность.`,
      keywords: `${siteName}, faq, частые вопросы, маркетинговое бюро вопросы`,
    },
    privacy: {
      title: `Политика конфиденциальности — ${siteName}`,
      description: `Политика конфиденциальности маркетингового бюро: какие данные мы собираем, как храним и используем.`,
      keywords: `${siteName}, политика конфиденциальности, обработка персональных данных`,
    },
  }

  const d = defaults[slug]
  return {
    slug,
    title: d.title,
    description: d.description,
    keywords: d.keywords,
    ogTitle: d.title,
    ogDescription: d.description,
    ogImage,
    twitterTitle: d.title,
    twitterDescription: d.description,
    twitterImage: ogImage,
  }
}

/**
 * Базовый schema.org JSON-LD по умолчанию для каждой страницы.
 * Если админ не задал свой — используется этот.
 */
function defaultSchemaOrg(
  slug: PageSlug,
  ctx: { siteName: string; siteUrl: string | null; email: string | null; phone: string | null }
): string {
  const { siteName, siteUrl, email, phone } = ctx
  const baseUrl = siteUrl || 'https://marketingbureau.kz'
  const pageUrl = slug === 'home' ? baseUrl : `${baseUrl}/?section=${slug}`

  if (slug === 'home') {
    // Organization / ProfessionalService на главной
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: siteName,
      url: baseUrl,
      email: email || undefined,
      telephone: phone || undefined,
      areaServed: 'KZ',
      serviceType: 'Marketing',
      description: `${siteName} — маркетинговое бюро полного цикла в Алматы.`,
    }, null, 2)
  }

  if (slug === 'faq') {
    // FAQPage — но без элементов; админ может расширить
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [],
    }, null, 2)
  }

  // WebPage для остальных
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${PAGE_LABELS[slug]} — ${siteName}`,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: baseUrl,
    },
  }, null, 2)
}

/**
 * Возвращает "эффективные" метаданные страницы:
 * берёт значения из БД, а пустые поля заполняет дефолтами.
 * Создаёт строку в БД, если её ещё нет (с дефолтными значениями).
 */
export async function getEffectivePageMeta(
  slug: PageSlug,
  ctx: { siteName: string; siteUrl: string | null; ogImage: string | null; email: string | null; phone: string | null }
): Promise<EffectivePageMeta> {
  let row = await db.pageMeta.findUnique({ where: { slug } })
  if (!row) {
    // Создаём с дефолтными значениями, чтобы админ видел их в форме
    const defaults = getPageDefaults(slug, ctx)
    row = await db.pageMeta.create({
      data: {
        slug,
        title: defaults.title,
        description: defaults.description,
        keywords: defaults.keywords,
        ogTitle: defaults.ogTitle,
        ogDescription: defaults.ogDescription,
        twitterTitle: defaults.twitterTitle,
        twitterDescription: defaults.twitterDescription,
        robotsIndex: true,
      },
    })
  }

  const defaults = getPageDefaults(slug, ctx)

  return {
    slug,
    title: row.title?.trim() || defaults.title,
    description: row.description?.trim() || defaults.description,
    keywords: row.keywords?.trim() || defaults.keywords,
    ogTitle: row.ogTitle?.trim() || defaults.ogTitle,
    ogDescription: row.ogDescription?.trim() || defaults.ogDescription,
    ogImage: row.ogImage || defaults.ogImage,
    twitterTitle: row.twitterTitle?.trim() || defaults.twitterTitle,
    twitterDescription: row.twitterDescription?.trim() || defaults.twitterDescription,
    twitterImage: row.twitterImage || row.ogImage || defaults.ogImage,
    robotsIndex: row.robotsIndex,
    canonicalUrl: row.canonicalUrl?.trim() || null,
    schemaOrg: row.schemaOrg?.trim() || defaultSchemaOrg(slug, ctx),
  }
}

/**
 * Возвращает "сырые" метаданные (для админки — показывает, что реально в БД).
 */
export async function getRawPageMeta(slug: PageSlug): Promise<RawPageMeta | null> {
  const row = await db.pageMeta.findUnique({ where: { slug } })
  if (!row) return null
  return row
}

/**
 * Возвращает все сырые метаданные страниц (для админки).
 * Если каких-то страниц нет в БД — создаёт со значениями по умолчанию.
 */
export async function getAllRawPageMeta(
  ctx: { siteName: string; siteUrl: string | null; ogImage: string | null }
): Promise<RawPageMeta[]> {
  const result: RawPageMeta[] = []
  for (const slug of ALL_PAGE_SLUGS) {
    let row = await db.pageMeta.findUnique({ where: { slug } })
    if (!row) {
      const defaults = getPageDefaults(slug, ctx)
      row = await db.pageMeta.create({
        data: {
          slug,
          title: defaults.title,
          description: defaults.description,
          keywords: defaults.keywords,
          ogTitle: defaults.ogTitle,
          ogDescription: defaults.ogDescription,
          twitterTitle: defaults.twitterTitle,
          twitterDescription: defaults.twitterDescription,
          robotsIndex: true,
        },
      })
    }
    result.push(row)
  }
  return result
}

export type PageMetaUpdate = Partial<{
  title: string | null
  description: string | null
  keywords: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  robotsIndex: boolean
  canonicalUrl: string | null
  schemaOrg: string | null
}>

export async function updatePageMeta(
  slug: PageSlug,
  data: PageMetaUpdate
): Promise<void> {
  await db.pageMeta.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  })
}
