/**
 * Заполнение БД начальными данными для marketingbureau.kz
 * Идемпотентный: безопасно запускать многократно.
 *
 * Запуск (локально):    npm run db:seed
 * Запуск (production):  npx tsx scripts/seed.ts
 *                       (после настройки DATABASE_URL на Vercel)
 *
 * ВАЖНО: перед первым запуском на production примените миграции:
 *   npx prisma migrate deploy
 */
import { db } from '../src/lib/db'

async function main() {
  // ─── 1. Настройки сайта ───────────────────────────────────
  const siteSettings = {
    siteName: 'Marketing Bureau',
    logoText: 'Marketing Bureau',
    email: 'hello@marketingbureau.kz',
    phone: '+7 775 849 40 20',
    // Адрес не указываем — работаем удалённо
    facebook: 'https://facebook.com/marketingbureau.kz',
    instagram: 'https://instagram.com/marketingbureau.kz',
    telegram: 'https://t.me/marketingbureau',
    primaryColor: '#0f172a',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    siteUrl: 'https://marketingbureau.kz',
    metaTitle: 'Marketing Bureau — маркетинговое бюро в Алматы',
    metaDescription:
      'Marketing Bureau — маркетинговое бюро полного цикла в Алматы. Стратегия, брендинг, performance-маркетинг, SMM, SEO. Превращаем бюджеты в клиентов в Казахстане и СНГ.',
    metaKeywords: 'маркетинговое бюро, маркетинг алматы, реклама алматы, seo алматы, smm казахстан, branding, performance',
    aboutText:
      'Marketing Bureau — команда маркетологов, стратегов и креаторов. С 2018 года помогаем бизнесу в Казахстане и СНГ расти через маркетинг: от исследования аудитории до запуска рекламных кампаний. Мы отвечаем за результат, а не за часы работы.',
    aboutContent:
      '<p>Marketing Bureau — команда маркетологов, стратегов и креаторов. С 2018 года помогаем бизнесу в Казахстане и СНГ расти через маркетинг: от исследования аудитории до запуска рекламных кампаний.</p><p>Мы отвечаем за результат, а не за часы. Работаем удалённо с клиентами по всему миру, но глубоко понимаем казахстанский рынок.</p><h2>Наш подход</h2><p>Мы объединяем стратегию, креатив и аналитику. Каждое решение основано на данных, а не на интуиции. Прозрачные отчёты, выделенная команда и фокус на бизнес-показателях — наши ключевые принципы.</p><h2>Что мы делаем</h2><p>Полный цикл маркетинговых услуг: стратегия, брендинг, performance-маркетинг, SMM, SEO и веб-разработка. Подбираем инструменты под цели бизнеса, а не наоборот.</p>',
    footerText: '© 2026 Marketing Bureau. Все права защищены.',
    // Авторизация
    adminPhone: '+77758494020',
    // Telegram-бот для уведомлений о заявках и сброса пароля.
    // Замените на свой токен через админку → «Настройки сайта» после первого сида.
    // Или задайте через env TELEGRAM_BOT_TOKEN (если используете CI/CD-сид).
    telegramBotToken: '',
    telegramLeadsChatId: '',
    // HERO
    heroTitle: 'Растим ваш бизнес через маркетинг',
    heroSubtitle:
      'Стратегия, брендинг, performance, SMM и SEO. Превращаем бюджеты в клиентов.',
    heroCtaText: 'Получить консультацию',
    heroCtaLink: '#cta',
    heroWhatsappText: 'Написать в WhatsApp',
    heroWhatsappLink: 'https://wa.me/77758494020',
    // Секции
    expertiseSectionTitle: 'Наша экспертиза',
    expertiseSectionText:
      'Мы объединяем стратегию, креатив и аналитику, чтобы решать задачи бизнеса на любом этапе роста.',
    servicesSectionTitle: 'Услуги',
    servicesSectionText:
      'Полный цикл маркетинговых услуг — от исследования аудитории до запуска рекламных кампаний.',
    whyUsSectionTitle: 'Почему выбирают нас',
    whyUsSectionText:
      'Мы отвечаем за результат, а не за часы. Прозрачные отчёты, выделенная команда и фокус на бизнес-показателях.',
    casesSectionTitle: 'Кейсы',
    casesSectionText:
      'Реальные проекты с измеримым результатом. Каждый кейс — это история о том, как маркетинг принёс бизнесу деньги.',
    faqSectionTitle: 'Частые вопросы',
    faqSectionText:
      'Собрали ответы на вопросы, которые чаще всего задают нам клиенты на старте работы.',
    // CTA
    ctaSectionTitle: 'Готовы обсудить ваш проект?',
    ctaSectionText:
      'Оставьте заявку — проведём бесплатный аудит вашего маркетинга и предложим план роста.',
    ctaBullet1: 'Бесплатная консультация — 30 минут',
    ctaBullet2: 'Ответим в течение рабочего дня',
    ctaBullet3: 'Без навязчивых звонков и спама',
  }

  await db.siteSettings.upsert({
    where: { id: 'default' },
    update: siteSettings,
    create: { id: 'default', ...siteSettings },
  })

  // ─── 2. Постраничные SEO (PageMeta) ──────────────────────
  const pages: { slug: string; title: string; description: string; keywords: string }[] = [
    {
      slug: 'home',
      title: 'Marketing Bureau — маркетинговое бюро в Алматы',
      description: 'Marketing Bureau — маркетинговое бюро полного цикла в Алматы. Стратегия, брендинг, performance-маркетинг, SMM, SEO. Превращаем бюджеты в клиентов в Казахстане и СНГ.',
      keywords: 'Marketing Bureau, маркетинговое бюро, маркетинг алматы, реклама алматы, seo алматы, smm казахстан, branding, performance',
    },
    {
      slug: 'services',
      title: 'Услуги — Marketing Bureau',
      description: 'Маркетинговые услуги полного цикла: стратегия, брендинг, performance-реклама, SMM, SEO, контент-маркетинг. Подбираем инструменты под ваши цели.',
      keywords: 'Marketing Bureau, маркетинговые услуги, реклама, seo, smm, брендинг, performance-маркетинг',
    },
    {
      slug: 'cases',
      title: 'Кейсы — Marketing Bureau',
      description: 'Реальные проекты маркетингового бюро: стратегии, рекламные кампании, ребрендинг. Измеримый результат и истории роста клиентов.',
      keywords: 'Marketing Bureau, кейсы, портфолио, проекты, маркетинговые кейсы',
    },
    {
      slug: 'about',
      title: 'О нас — Marketing Bureau',
      description: 'Marketing Bureau — команда маркетологов, стратегов и креаторов. Узнайте о нашем подходе, ценностях и принципах работы с клиентами.',
      keywords: 'Marketing Bureau, о компании, команда маркетологов, маркетинговое агентство',
    },
    {
      slug: 'blog',
      title: 'Блог — Marketing Bureau',
      description: 'Статьи о маркетинге, кейсах и трендах. Делимся опытом работы с клиентами в Казахстане и СНГ.',
      keywords: 'Marketing Bureau, блог, статьи о маркетинге, маркетинг казахстан',
    },
    {
      slug: 'article',
      title: 'Статья — Marketing Bureau',
      description: 'Полезные статьи о маркетинге от Marketing Bureau. Стратегии, кейсы, тренды и практические советы.',
      keywords: 'Marketing Bureau, статья, маркетинг, советы, кейсы',
    },
    {
      slug: 'faq',
      title: 'Частые вопросы — Marketing Bureau',
      description: 'Ответы на популярные вопросы о работе с маркетинговым бюро: процессы, оплата, сроки, отчётность.',
      keywords: 'Marketing Bureau, faq, частые вопросы, маркетинговое бюро вопросы',
    },
    {
      slug: 'privacy',
      title: 'Политика конфиденциальности — Marketing Bureau',
      description: 'Политика конфиденциальности маркетингового бюро: какие данные мы собираем, как храним и используем.',
      keywords: 'Marketing Bureau, политика конфиденциальности, обработка персональных данных',
    },
  ]

  for (const p of pages) {
    await db.pageMeta.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        keywords: p.keywords,
        ogTitle: p.title,
        ogDescription: p.description,
        twitterTitle: p.title,
        twitterDescription: p.description,
        robotsIndex: true,
      },
    })
  }

  // ─── 3. Экспертиза ───────────────────────────────────────
  const expertise = [
    { title: 'Стратегия', description: 'Маркетинговая стратегия, основанная на исследовании рынка, аудитории и конкурентов.', icon: 'compass', sortOrder: 1 },
    { title: 'Performance', description: 'Управление платным трафиком: Google Ads, Meta Ads, Яндекс Директ. Считаем каждый тенге.', icon: 'target', sortOrder: 2 },
    { title: 'Брендинг', description: 'Айдентика, позиционирование, tone of voice. Создаём бренды, которые запоминают.', icon: 'pen_tool', sortOrder: 3 },
    { title: 'SMM', description: 'Ведение соцсетей с фокусом на бизнес-показатели, а не на лайки ради лайков.', icon: 'message_square', sortOrder: 4 },
    { title: 'SEO', description: 'Технический и контентный SEO. Растём в выдаче по целевым запросам.', icon: 'search', sortOrder: 5 },
    { title: 'Аналитика', description: 'Сквозная аналитика, дашборды, отчётность. Понятно, где деньги, а где слив.', icon: 'bar_chart', sortOrder: 6 },
  ]
  for (const e of expertise) {
    const existing = await db.expertiseItem.findFirst({ where: { title: e.title } })
    if (existing) continue
    await db.expertiseItem.create({ data: e })
  }

  // ─── 4. Услуги ───────────────────────────────────────────
  const services = [
    {
      title: 'Маркетинговая стратегия',
      slug: 'marketing-strategy',
      excerpt: 'Документ, который отвечает на вопросы «что делать», «в каком порядке» и «сколько это даст».',
      content: '<p>Разрабатываем маркетинговую стратегию на основе исследования рынка, аудитории и конкурентов. На выходе — понятный документ с приоритетами, бюджетами и KPI.</p><h3>Что входит</h3><ul><li>Анализ рынка и конкурентов</li><li>Карта целевой аудитории</li><li>Позиционирование и УТП</li><li>Channel-mix и бюджет</li><li>KPI и метрики успеха</li></ul>',
      icon: 'compass',
      sortOrder: 1,
    },
    {
      title: 'Performance-маркетинг',
      slug: 'performance-marketing',
      excerpt: 'Google Ads, Meta Ads, Яндекс Директ. Считаем каждый тенге и оптимизируем ROAS.',
      content: '<p>Запускаем и ведём рекламные кампании в Google Ads, Meta Ads (Facebook/Instagram) и Яндекс Директ. Работаем по CPA/ROAS, а не по «потраченным бюджетам».</p><h3>Что входит</h3><ul><li>Настройка пикселей и конверсий</li><li>Создание креативов</li><li>A/B-тестирование</li><li>Еженедельная оптимизация</li><li>Сквозная аналитика</li></ul>',
      icon: 'target',
      sortOrder: 2,
    },
    {
      title: 'Брендинг и айдентика',
      slug: 'branding',
      excerpt: 'Логотип, фирменный стиль, tone of voice. Создаём бренды, которые запоминают.',
      content: '<p>Создаём или обновляем визуальную и смысловую айдентику бренда. Помогаем выделиться на фоне конкурентов и говорить с аудиторией на одном языке.</p><h3>Что входит</h3><ul><li>Логотип и фирстиль</li><li>Брендбук</li><li>Tone of voice</li><li>Шаблоны коммуникаций</li></ul>',
      icon: 'pen_tool',
      sortOrder: 3,
    },
    {
      title: 'SMM и контент',
      slug: 'smm-content',
      excerpt: 'Ведение Instagram, Facebook, Telegram. С фокусом на бизнес-показатели, а не на лайки.',
      content: '<p>Ведём соцсети как канал привлечения клиентов, а не как витрину. Делаем контент-стратегию, продакшен, таргетинг и комьюнити-менеджмент.</p><h3>Что входит</h3><ul><li>Контент-стратегия</li><li>Дизайн и копирайтинг</li><li>Таргетированная реклама</li><li>Комьюнити-менеджмент</li><li>Ежемесячная отчётность</li></ul>',
      icon: 'message_square',
      sortOrder: 4,
    },
    {
      title: 'SEO-продвижение',
      slug: 'seo',
      excerpt: 'Технический и контентный SEO. Растём в выдаче по целевым запросам.',
      content: '<p>Выводим сайт в топ поисковой выдачи по целевым запросам. Работаем параллельно с технической и контентной частью.</p><h3>Что входит</h3><ul><li>Технический аудит</li><li>Семантическое ядро</li><li>Контент-план и тексты</li><li>Линкбилдинг</li><li>Мониторинг позиций</li></ul>',
      icon: 'search',
      sortOrder: 5,
    },
    {
      title: 'Веб-разработка',
      slug: 'web-development',
      excerpt: 'Корпоративные сайты, лендинги, интернет-магазины. Быстро, поддерживаемо, с прицелом на конверсию.',
      content: '<p>Разрабатываем сайты, которые работают на бизнес: быстро грузятся, удобно редактируются, легко масштабируются.</p><h3>Что входит</h3><ul><li>UX/UI-дизайн</li><li>Frontend и backend</li><li>CMS для самостоятельного редактирования</li><li>Интеграции с CRM и аналитикой</li></ul>',
      icon: 'code',
      sortOrder: 6,
    },
  ]
  for (const s of services) {
    const existing = await db.service.findUnique({ where: { slug: s.slug } })
    if (existing) continue
    await db.service.create({ data: { ...s, published: true, featured: false } })
  }

  // ─── 5. Почему мы ────────────────────────────────────────
  const whyUs = [
    { title: 'Фокус на результате', description: 'Работаем по KPI, а не по часам. Если кампания не приносит — останавливаем и пересобираем.', icon: 'target', sortOrder: 1 },
    { title: 'Прозрачная отчётность', description: 'Еженедельные и ежемесячные отчёты с метриками. Видите, на что уходит каждый тенге.', icon: 'bar_chart', sortOrder: 2 },
    { title: 'Выделенная команда', description: 'Аккаунт-менеджер, стратег, креатор, таргетолог — все в одном контактном окне.', icon: 'users', sortOrder: 3 },
    { title: '8 лет в рынке', description: 'С 2018 года запустили 200+ проектов в Казахстане, СНГ и Европе. Знаем, что работает.', icon: 'award', sortOrder: 4 },
  ]
  for (const w of whyUs) {
    const existing = await db.whyUsItem.findFirst({ where: { title: w.title } })
    if (existing) continue
    await db.whyUsItem.create({ data: w })
  }

  // ─── 6. Кейсы ────────────────────────────────────────────
  const cases = [
    {
      title: 'Ребрендинг финтех-стартапа: +180% узнаваемости',
      slug: 'rebranding-fintech',
      client: 'FinTech Kazakhstan',
      excerpt: 'Полный ребрендинг финтех-стартапа: от стратегии до нового сайта. За 6 месяцев узнаваемость бренда выросла на 180%.',
      content: '<p>Подход: исследование аудитории → новая стратегия позиционирования → айдентика → сайт → запусковая кампания.</p><h3>Результат</h3><ul><li>Узнаваемость бренда +180%</li><li>Конверсия в заявку +45%</li><li>CAC снизился на 30%</li></ul>',
      results: '+180% узнаваемости',
      tags: JSON.stringify(['брендинг', 'финтех', 'стратегия']),
      sortOrder: 1,
    },
    {
      title: 'Performance-кампания для e-commerce: ROAS 4.2x',
      slug: 'performance-ecommerce',
      client: 'Online Store KZ',
      excerpt: 'Запуск платного трафика для интернет-магазина. За 3 месяца добились ROAS 4.2x и +120% выручки.',
      content: '<p>Подход: сквозная аналитика → реструктуризация Google Ads и Meta Ads → креативы → оптимизация.</p><h3>Результат</h3><ul><li>ROAS 4.2x</li><li>Выручка +120%</li><li>CPA -28%</li></ul>',
      results: 'ROAS 4.2x',
      tags: JSON.stringify(['performance', 'e-commerce', 'google-ads']),
      sortOrder: 2,
    },
    {
      title: 'SEO для B2B-сервиса: x3 органического трафика',
      slug: 'seo-b2b',
      client: 'B2B SaaS',
      excerpt: 'Технический и контентный SEO для B2B-сервиса. За 8 месяцев органический трафик вырос в 3 раза.',
      content: '<p>Подход: технический аудит → семантическое ядро → контент-стратегия → линкбилдинг.</p><h3>Результат</h3><ul><li>Органический трафик x3</li><li>Топ-3 по 45 целевым запросам</li><li>Лиды из SEO +220%</li></ul>',
      results: 'x3 трафика',
      tags: JSON.stringify(['seo', 'b2b', 'контент']),
      sortOrder: 3,
    },
  ]
  for (const c of cases) {
    const existing = await db.caseItem.findUnique({ where: { slug: c.slug } })
    if (existing) continue
    await db.caseItem.create({ data: { ...c, published: true, featured: true } })
  }

  // ─── 7. FAQ ──────────────────────────────────────────────
  const faqs = [
    { question: 'С чего начинается работа?', answer: 'С бесплатной 30-минутной консультации. На ней мы разбираем ваши задачи, цели и текущую ситуацию, а затем предлагаем план действий.', sortOrder: 1 },
    { question: 'Какой минимальный бюджет на маркетинг?', answer: 'Зависит от задач и каналов. Минимальный ежемесячный бюджет на performance-маркетинг — от 500 000 ₸ на рекламу + наша комиссия. Для SMM-ведения — от 300 000 ₸/мес.', sortOrder: 2 },
    { question: 'Вы работаете по KPI или по часам?', answer: 'По KPI. Мы согласуем метрики успеха на старте и отчитываемся по ним. Если кампания не приносит результат — мы её останавливаем и пересобираем, не списывая часы.', sortOrder: 3 },
    { question: 'Сколько времени занимает запуск?', answer: 'Стратегию запускаем за 2–3 недели, performance-кампании — за 1–2 недели, SMM-ведение стартует в течение недели после подписания договора.', sortOrder: 4 },
    { question: 'Вы работаете только в Казахстане?', answer: 'Основной фокус — Казахстан и СНГ, но также ведём проекты для клиентов из Европы и США. Работаем удалённо.', sortOrder: 5 },
    { question: 'Какая отчётность?', answer: 'Еженедельные короткие апдейты и ежемесячный подробный отчёт с метриками, выводами и планом на следующий месяц. Доступ к дашборду в реальном времени.', sortOrder: 6 },
  ]
  for (const f of faqs) {
    const existing = await db.faqItem.findFirst({ where: { question: f.question } })
    if (existing) continue
    await db.faqItem.create({ data: { ...f, published: true } })
  }

  // ─── 8. Демо-блог ────────────────────────────────────────
  const articles = [
    {
      type: 'ARTICLE',
      title: '5 трендов маркетинга в Казахстане на 2026 год',
      slug: '5-trendov-marketinga-kz-2026',
      excerpt: 'Короткий обзор того, что будет работать в казахстанском маркетинге в 2026 году: от видео до AI-креативов.',
      content: '<h2>Что важно</h2><p>Рынок digital-рекламы в Казахстане растёт на 25% в год. В 2026 году выделим 5 трендов, которые стоит держать в фокусе.</p><h3>1. Короткие видео</h3><p>Reels, Shorts, TikTok — основной формат потребления контента. Если вы ещё не снимаете, пора начинать.</p><h3>2. AI-креативы</h3><p>Генеративные инструменты ускоряют продакшен в 3–5 раз.</p><h3>3. Микро-инфлюенсеры</h3><p>Работают лучше макро-блогеров при меньшем бюджете.</p><h3>4. Локальный SEO</h3><p>Google My Business и локальная выдача — must-have для офлайн-бизнеса.</p><h3>5. Маркетинг в Telegram</h3><p>Платформа №1 в Казахстане по вовлечённости.</p>',
      author: 'Marketing Bureau',
      tags: JSON.stringify(['тренды', '2026', 'казахстан']),
      published: true,
      featured: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    },
  ]
  for (const a of articles) {
    const existing = await db.article.findUnique({ where: { slug: a.slug } })
    if (existing) continue
    await db.article.create({ data: { ...a, coverImage: null } as any })
  }

  console.log('✓ Seed completed')
  const counts = await Promise.all([
    db.pageMeta.count(),
    db.service.count(),
    db.caseItem.count(),
    db.faqItem.count(),
    db.expertiseItem.count(),
    db.whyUsItem.count(),
    db.article.count(),
  ])
  console.log(`  PageMeta: ${counts[0]}`)
  console.log(`  Services: ${counts[1]}`)
  console.log(`  Cases: ${counts[2]}`)
  console.log(`  FAQ: ${counts[3]}`)
  console.log(`  Expertise: ${counts[4]}`)
  console.log(`  WhyUs: ${counts[5]}`)
  console.log(`  Articles: ${counts[6]}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
