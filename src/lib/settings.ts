import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import crypto from 'crypto'

export type SiteSettingsPublic = {
  siteName: string
  logoUrl: string | null
  logoText: string | null
  metaTitle: string
  metaDescription: string
  metaKeywords: string | null
  metaAuthor: string | null
  ogTitle: string
  ogDescription: string
  ogImage: string | null
  ogType: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string | null
  favicon: string | null
  email: string | null
  phone: string | null
  address: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  telegram: string | null
  primaryColor: string
  accentColor: string
  backgroundColor: string
  robotsIndex: boolean
  googleAnalytics: string | null
  yandexMetrika: string | null
  siteUrl: string | null
  footerText: string
  aboutText: string | null
  aboutContent: string | null
  // Секции главной
  heroTitle: string
  heroSubtitle: string
  heroBackground: string | null
  heroCtaText: string
  heroCtaLink: string
  heroWhatsappText: string
  heroWhatsappLink: string
  expertiseSectionTitle: string
  expertiseSectionText: string
  servicesSectionTitle: string
  servicesSectionText: string
  whyUsSectionTitle: string
  whyUsSectionText: string
  casesSectionTitle: string
  casesSectionText: string
  faqSectionTitle: string
  faqSectionText: string
  ctaSectionTitle: string
  ctaSectionText: string
  ctaButtonText: string
  ctaButtonLink: string
  ctaBackground: string | null
  ctaBullet1: string
  ctaBullet2: string
  ctaBullet3: string
}

const DEFAULT_SITE_NAME = 'Marketing Bureau'

/**
 * Возвращает настройки сайта.
 * Если строка в БД отсутствует, создаёт её со значениями по умолчанию.
 * Применяет логику "по умолчанию" для мета-данных и контента секций.
 */
export async function getSiteSettings(): Promise<SiteSettingsPublic> {
  let row = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (!row) {
    row = await db.siteSettings.create({ data: { id: 'default' } })
  }

  const siteName = row.siteName
  const metaTitle = row.metaTitle || `${siteName} — маркетинговое бюро в Алматы`
  const metaDescription =
    row.metaDescription ||
    `${siteName} — маркетинговое бюро полного цикла. Стратегия, брендинг, performance-маркетинг, SMM, SEO. Растим бизнес клиентов в Казахстане и СНГ.`
  const ogTitle = row.ogTitle || metaTitle
  const ogDescription = row.ogDescription || metaDescription
  const twitterTitle = row.twitterTitle || ogTitle
  const twitterDescription = row.twitterDescription || ogDescription
  const metaAuthor = row.metaAuthor || siteName

  return {
    siteName,
    logoUrl: row.logoUrl,
    logoText: row.logoText,
    metaTitle,
    metaDescription,
    metaKeywords: row.metaKeywords,
    metaAuthor,
    ogTitle,
    ogDescription,
    ogImage: row.ogImage,
    ogType: row.ogType || 'website',
    twitterCard: row.twitterCard || 'summary_large_image',
    twitterTitle,
    twitterDescription,
    twitterImage: row.twitterImage,
    favicon: row.favicon,
    email: row.email,
    phone: row.phone,
    address: row.address,
    facebook: row.facebook,
    twitter: row.twitter,
    instagram: row.instagram,
    youtube: row.youtube,
    telegram: row.telegram,
    primaryColor: row.primaryColor,
    accentColor: row.accentColor,
    backgroundColor: row.backgroundColor,
    robotsIndex: row.robotsIndex,
    googleAnalytics: row.googleAnalytics,
    yandexMetrika: row.yandexMetrika,
    siteUrl: row.siteUrl,
    footerText: row.footerText || `© ${new Date().getFullYear()} ${siteName}. Все права защищены.`,
    aboutText: row.aboutText,
    aboutContent: row.aboutContent,
    // Секции главной
    heroTitle: row.heroTitle || 'Растим ваш бизнес через маркетинг',
    heroSubtitle:
      row.heroSubtitle ||
      'Стратегия, брендинг, performance, SMM и SEO. Превращаем бюджеты в клиентов.',
    heroBackground: row.heroBackground,
    heroCtaText: row.heroCtaText || 'Получить консультацию',
    heroCtaLink: row.heroCtaLink || '#cta',
    heroWhatsappText: row.heroWhatsappText || 'Написать в WhatsApp',
    heroWhatsappLink: row.heroWhatsappLink || 'https://wa.me/77758494020',
    expertiseSectionTitle: row.expertiseSectionTitle || 'Наша экспертиза',
    expertiseSectionText:
      row.expertiseSectionText ||
      'Мы объединяем стратегию, креатив и аналитику, чтобы решать задачи бизнеса на любом этапе роста.',
    servicesSectionTitle: row.servicesSectionTitle || 'Услуги',
    servicesSectionText:
      row.servicesSectionText ||
      'Полный цикл маркетинговых услуг — от исследования аудитории до запуска рекламных кампаний.',
    whyUsSectionTitle: row.whyUsSectionTitle || 'Почему выбирают нас',
    whyUsSectionText:
      row.whyUsSectionText ||
      'Мы отвечаем за результат, а не за часы. Прозрачные отчёты, выделенная команда и фокус на бизнес-показателях.',
    casesSectionTitle: row.casesSectionTitle || 'Кейсы',
    casesSectionText:
      row.casesSectionText ||
      'Реальные проекты с измеримым результатом. Каждый кейс — это история о том, как маркетинг принёс бизнесу деньги.',
    faqSectionTitle: row.faqSectionTitle || 'Частые вопросы',
    faqSectionText:
      row.faqSectionText ||
      'Собрали ответы на вопросы, которые чаще всего задают нам клиенты на старте работы.',
    ctaSectionTitle: row.ctaSectionTitle || 'Готовы обсудить ваш проект?',
    ctaSectionText:
      row.ctaSectionText ||
      'Оставьте заявку — проведём бесплатный аудит вашего маркетинга и предложим план роста.',
    ctaButtonText: row.ctaButtonText || 'Оставить заявку',
    ctaButtonLink: row.ctaButtonLink || 'mailto:hello@marketingbureau.kz',
    ctaBackground: row.ctaBackground,
    ctaBullet1: row.ctaBullet1 || 'Бесплатная консультация — 30 минут',
    ctaBullet2: row.ctaBullet2 || 'Ответим в течение рабочего дня',
    ctaBullet3: row.ctaBullet3 || 'Без навязчивых звонков и спама',
  }
}

export async function getRawSiteSettings() {
  let row = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (!row) {
    row = await db.siteSettings.create({ data: { id: 'default' } })
  }
  return row
}

export type SiteSettingsUpdate = Partial<{
  siteName: string
  logoUrl: string | null
  logoText: string | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  metaAuthor: string | null
  ogTitle: string | null
  ogDescription: string | null
  ogImage: string | null
  ogType: string
  twitterCard: string
  twitterTitle: string | null
  twitterDescription: string | null
  twitterImage: string | null
  favicon: string | null
  email: string | null
  phone: string | null
  address: string | null
  facebook: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  telegram: string | null
  primaryColor: string
  accentColor: string
  backgroundColor: string
  robotsIndex: boolean
  googleAnalytics: string | null
  yandexMetrika: string | null
  siteUrl: string | null
  footerText: string | null
  aboutText: string | null
  aboutContent: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  heroBackground: string | null
  heroCtaText: string | null
  heroCtaLink: string | null
  heroWhatsappText: string | null
  heroWhatsappLink: string | null
  expertiseSectionTitle: string | null
  expertiseSectionText: string | null
  servicesSectionTitle: string | null
  servicesSectionText: string | null
  whyUsSectionTitle: string | null
  whyUsSectionText: string | null
  casesSectionTitle: string | null
  casesSectionText: string | null
  faqSectionTitle: string | null
  faqSectionText: string | null
  ctaSectionTitle: string | null
  ctaSectionText: string | null
  ctaButtonText: string | null
  ctaButtonLink: string | null
  ctaBackground: string | null
  ctaBullet1: string | null
  ctaBullet2: string | null
  ctaBullet3: string | null
  adminPasswordHash: string
  passwordResetToken: string | null
  passwordResetExpires: Date | null
}>

export async function updateSiteSettings(
  data: SiteSettingsUpdate
): Promise<void> {
  await db.siteSettings.upsert({
    where: { id: 'default' },
    update: { ...data, id: 'default' },
    create: { id: 'default', ...data },
  })
}

export async function changeAdminPassword(
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  const settings = await getRawSiteSettings()
  if (!verifyPassword(oldPassword, settings.adminPasswordHash)) {
    return false
  }
  await updateSiteSettings({ adminPasswordHash: hashPassword(newPassword) })
  return true
}

export async function verifyAdminCredentials(phone: string, password: string): Promise<boolean> {
  const settings = await getRawSiteSettings()
  // Нормализуем телефон: убираем пробелы, дефисы, скобки
  const normalizePhone = (p: string) => p.replace(/[\s\-\(\)]/g, '').trim()
  if (normalizePhone(phone) !== normalizePhone(settings.adminPhone)) {
    return false
  }
  return verifyPassword(password, settings.adminPasswordHash)
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const settings = await getRawSiteSettings()
  return verifyPassword(password, settings.adminPasswordHash)
}

export async function getAdminPhone(): Promise<string> {
  const settings = await getRawSiteSettings()
  return settings.adminPhone
}

export async function getTelegramBotToken(): Promise<string | null> {
  const settings = await getRawSiteSettings()
  return settings.telegramBotToken
}

export async function createPasswordResetToken(): Promise<{ token: string; expires: Date } | null> {
  const settings = await getRawSiteSettings()
  if (!settings.adminPhone) return null
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 30 * 60 * 1000) // 30 минут
  await updateSiteSettings({
    passwordResetToken: token,
    passwordResetExpires: expires,
  })
  return { token, expires }
}

export async function verifyResetToken(token: string): Promise<boolean> {
  const settings = await getRawSiteSettings()
  if (!settings.passwordResetToken || !settings.passwordResetExpires) return false
  if (settings.passwordResetToken !== token) return false
  if (new Date() > settings.passwordResetExpires) return false
  return true
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const ok = await verifyResetToken(token)
  if (!ok) return false
  await updateSiteSettings({
    adminPasswordHash: hashPassword(newPassword),
    passwordResetToken: null,
    passwordResetExpires: null,
  })
  return true
}

// Используется в миграциях и seed
export const DEFAULTS = { SITE_NAME: DEFAULT_SITE_NAME }
