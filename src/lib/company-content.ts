import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'

// ───────────────────────────────────────────────
// ХЕЛПЕРЫ
// ───────────────────────────────────────────────

/**
 * Превращает Prisma-ошибку P2025 ("record not found") в человекочитаемое сообщение.
 * Используется во всех adminUpdate* / adminDelete* функциях.
 */
function wrapNotFoundError(e: unknown, entityLabel: string): Error {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
    return new Error(`${entityLabel} не найден(а) — возможно, был удалён. Обновите список.`)
  }
  return e instanceof Error ? e : new Error(String(e))
}

// ───────────────────────────────────────────────
// УСЛУГИ
// ───────────────────────────────────────────────

export type ServicePublic = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  icon: string | null
  iconImage: string | null
  sortOrder: number
  featured: boolean
}

export async function getPublishedServices(limit?: number): Promise<ServicePublic[]> {
  const rows = await db.service.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map(toServicePublic)
}

export async function adminListServices() {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  return db.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] })
}

export async function adminGetService(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  return db.service.findUnique({ where: { id } })
}

export type ServiceInput = {
  title: string
  slug?: string
  excerpt?: string
  content?: string
  icon?: string
  iconImage?: string | null
  sortOrder?: number
  published?: boolean
  featured?: boolean
}

function slugifyService(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/giu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

async function ensureUniqueServiceSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug || `service-${Date.now()}`
  let suffix = 1
  while (true) {
    const existing = await db.service.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    suffix++
    candidate = `${slug}-${suffix}`
  }
}

export async function adminCreateService(input: ServiceInput) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const slug = await ensureUniqueServiceSlug(slugifyService(input.slug || input.title))
  const row = await db.service.create({
    data: {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt?.trim() || null,
      content: input.content || null,
      icon: input.icon || null,
      iconImage: input.iconImage?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      published: input.published ?? true,
      featured: input.featured ?? false,
    },
  })
  revalidatePath('/')
  return row
}

export async function adminUpdateService(id: string, input: Partial<ServiceInput>) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const existing = await db.service.findUnique({ where: { id } })
  if (!existing) throw new Error('Услуга не найдена — возможно, была удалена. Обновите список.')

  const data: any = {}
  if (input.title !== undefined) data.title = input.title.trim()
  if (input.slug !== undefined && input.slug !== existing.slug) {
    data.slug = await ensureUniqueServiceSlug(slugifyService(input.slug || existing.title), id)
  }
  if (input.excerpt !== undefined) data.excerpt = input.excerpt?.trim() || null
  if (input.content !== undefined) data.content = input.content || null
  if (input.icon !== undefined) data.icon = input.icon || null
  if (input.iconImage !== undefined) data.iconImage = input.iconImage?.trim() || null
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder
  if (input.published !== undefined) data.published = input.published
  if (input.featured !== undefined) data.featured = input.featured

  let row
  try {
    row = await db.service.update({ where: { id }, data })
  } catch (e) {
    throw wrapNotFoundError(e, 'Услуга')
  }
  revalidatePath('/')
  return row
}

export async function adminDeleteService(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  try {
    await db.service.delete({ where: { id } })
  } catch (e) {
    throw wrapNotFoundError(e, 'Услуга')
  }
  revalidatePath('/')
}

function toServicePublic(a: any): ServicePublic {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    content: a.content,
    icon: a.icon,
    iconImage: a.iconImage,
    sortOrder: a.sortOrder,
    featured: a.featured,
  }
}

// ───────────────────────────────────────────────
// КЕЙСЫ
// ───────────────────────────────────────────────

export type CasePublic = {
  id: string
  title: string
  slug: string
  client: string | null
  excerpt: string | null
  content: string | null
  coverImage: string | null
  results: string | null
  tags: string[] | null
  featured: boolean
  createdAt: Date
}

function parseTags(tags: string | null | undefined): string[] | null {
  if (!tags) return null
  try {
    const parsed = JSON.parse(tags)
    if (Array.isArray(parsed)) return parsed.filter((t) => typeof t === 'string')
    return null
  } catch {
    return tags.split(',').map((t) => t.trim()).filter(Boolean)
  }
}

function toCasePublic(a: any): CasePublic {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    client: a.client,
    excerpt: a.excerpt,
    content: a.content,
    coverImage: a.coverImage,
    results: a.results,
    tags: parseTags(a.tags),
    featured: a.featured,
    createdAt: a.createdAt,
  }
}

export async function getPublishedCases(limit?: number): Promise<CasePublic[]> {
  const rows = await db.caseItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map(toCasePublic)
}

/**
 * Получить опубликованный кейс по slug (для публичной детальной страницы).
 * Если кейс не найден или не опубликован — возвращает null.
 */
export async function getPublishedCaseBySlug(slug: string): Promise<CasePublic | null> {
  const row = await db.caseItem.findUnique({ where: { slug } })
  if (!row) return null
  if (!row.published) return null
  return toCasePublic(row)
}

/**
 * Похожие кейсы (по тегам или просто следующие по сортировке).
 */
export async function getRelatedCases(currentId: string, limit = 3): Promise<CasePublic[]> {
  const rows = await db.caseItem.findMany({
    where: {
      published: true,
      id: { not: currentId },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map(toCasePublic)
}

export async function adminListCases() {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const rows = await db.caseItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] })
  return rows.map((r) => ({ ...r, tags: parseTags(r.tags) }))
}

export async function adminGetCase(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const row = await db.caseItem.findUnique({ where: { id } })
  if (!row) return null
  return { ...row, tags: parseTags(row.tags) }
}

export type CaseInput = {
  title: string
  slug?: string
  client?: string
  excerpt?: string
  content?: string
  coverImage?: string | null
  results?: string
  tags?: string[]
  sortOrder?: number
  published?: boolean
  featured?: boolean
}

async function ensureUniqueCaseSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug || `case-${Date.now()}`
  let suffix = 1
  while (true) {
    const existing = await db.caseItem.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    suffix++
    candidate = `${slug}-${suffix}`
  }
}

export async function adminCreateCase(input: CaseInput) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const slug = await ensureUniqueCaseSlug(
    (input.slug || input.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яё\s-]/giu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 100)
  )
  const row = await db.caseItem.create({
    data: {
      title: input.title.trim(),
      slug,
      client: input.client?.trim() || null,
      excerpt: input.excerpt?.trim() || null,
      content: input.content || null,
      coverImage: input.coverImage?.trim() || null,
      results: input.results?.trim() || null,
      tags: input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null,
      sortOrder: input.sortOrder ?? 0,
      published: input.published ?? true,
      featured: input.featured ?? false,
    },
  })
  revalidatePath('/')
  return row
}

export async function adminUpdateCase(id: string, input: Partial<CaseInput>) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const existing = await db.caseItem.findUnique({ where: { id } })
  if (!existing) throw new Error('Кейс не найден — возможно, был удалён. Обновите список.')

  const data: any = {}
  if (input.title !== undefined) data.title = input.title.trim()
  if (input.slug !== undefined && input.slug !== existing.slug) {
    data.slug = await ensureUniqueCaseSlug(
      (input.slug || existing.title)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9а-яё\s-]/giu, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 100),
      id
    )
  }
  if (input.client !== undefined) data.client = input.client?.trim() || null
  if (input.excerpt !== undefined) data.excerpt = input.excerpt?.trim() || null
  if (input.content !== undefined) data.content = input.content || null
  if (input.coverImage !== undefined) data.coverImage = input.coverImage?.trim() || null
  if (input.results !== undefined) data.results = input.results?.trim() || null
  if (input.tags !== undefined) {
    data.tags = input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null
  }
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder
  if (input.published !== undefined) data.published = input.published
  if (input.featured !== undefined) data.featured = input.featured

  let row
  try {
    row = await db.caseItem.update({ where: { id }, data })
  } catch (e) {
    throw wrapNotFoundError(e, 'Кейс')
  }
  revalidatePath('/')
  return row
}

export async function adminDeleteCase(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  try {
    await db.caseItem.delete({ where: { id } })
  } catch (e) {
    throw wrapNotFoundError(e, 'Кейс')
  }
  revalidatePath('/')
}

// ───────────────────────────────────────────────
// FAQ
// ───────────────────────────────────────────────

export type FaqPublic = {
  id: string
  question: string
  answer: string
  sortOrder: number
}

export async function getPublishedFaq(limit?: number): Promise<FaqPublic[]> {
  const rows = await db.faqItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    answer: r.answer,
    sortOrder: r.sortOrder,
  }))
}

export async function adminListFaq() {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  return db.faqItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] })
}

export type FaqInput = {
  question: string
  answer: string
  sortOrder?: number
  published?: boolean
}

export async function adminCreateFaq(input: FaqInput) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const row = await db.faqItem.create({
    data: {
      question: input.question.trim(),
      answer: input.answer,
      sortOrder: input.sortOrder ?? 0,
      published: input.published ?? true,
    },
  })
  revalidatePath('/')
  return row
}

export async function adminUpdateFaq(id: string, input: Partial<FaqInput>) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const existing = await db.faqItem.findUnique({ where: { id } })
  if (!existing) throw new Error('Вопрос не найден — возможно, был удалён. Обновите список.')
  const data: any = {}
  if (input.question !== undefined) data.question = input.question.trim()
  if (input.answer !== undefined) data.answer = input.answer
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder
  if (input.published !== undefined) data.published = input.published
  let row
  try {
    row = await db.faqItem.update({ where: { id }, data })
  } catch (e) {
    throw wrapNotFoundError(e, 'Вопрос')
  }
  revalidatePath('/')
  return row
}

export async function adminDeleteFaq(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  try {
    await db.faqItem.delete({ where: { id } })
  } catch (e) {
    throw wrapNotFoundError(e, 'Вопрос')
  }
  revalidatePath('/')
}

// ───────────────────────────────────────────────
// ЭКСПЕРТИЗА
// ───────────────────────────────────────────────

export type ExpertisePublic = {
  id: string
  title: string
  description: string | null
  icon: string | null
  iconImage: string | null
  sortOrder: number
}

export async function getPublishedExpertise(limit?: number): Promise<ExpertisePublic[]> {
  const rows = await db.expertiseItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    icon: r.icon,
    iconImage: r.iconImage,
    sortOrder: r.sortOrder,
  }))
}

export async function adminListExpertise() {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  return db.expertiseItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] })
}

export type ExpertiseInput = {
  title: string
  description?: string
  icon?: string
  iconImage?: string | null
  sortOrder?: number
  published?: boolean
}

export async function adminCreateExpertise(input: ExpertiseInput) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const row = await db.expertiseItem.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      icon: input.icon || null,
      iconImage: input.iconImage?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      published: input.published ?? true,
    },
  })
  revalidatePath('/')
  return row
}

export async function adminUpdateExpertise(id: string, input: Partial<ExpertiseInput>) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const existing = await db.expertiseItem.findUnique({ where: { id } })
  if (!existing) throw new Error('Экспертиза не найдена — возможно, была удалена. Обновите список.')
  const data: any = {}
  if (input.title !== undefined) data.title = input.title.trim()
  if (input.description !== undefined) data.description = input.description?.trim() || null
  if (input.icon !== undefined) data.icon = input.icon || null
  if (input.iconImage !== undefined) data.iconImage = input.iconImage?.trim() || null
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder
  if (input.published !== undefined) data.published = input.published
  let row
  try {
    row = await db.expertiseItem.update({ where: { id }, data })
  } catch (e) {
    throw wrapNotFoundError(e, 'Экспертиза')
  }
  revalidatePath('/')
  return row
}

export async function adminDeleteExpertise(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  try {
    await db.expertiseItem.delete({ where: { id } })
  } catch (e) {
    throw wrapNotFoundError(e, 'Экспертиза')
  }
  revalidatePath('/')
}

// ───────────────────────────────────────────────
// ПОЧЕМУ МЫ
// ───────────────────────────────────────────────

export type WhyUsPublic = {
  id: string
  title: string
  description: string | null
  icon: string | null
  sortOrder: number
}

export async function getPublishedWhyUs(limit?: number): Promise<WhyUsPublic[]> {
  const rows = await db.whyUsItem.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    icon: r.icon,
    sortOrder: r.sortOrder,
  }))
}

export async function adminListWhyUs() {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  return db.whyUsItem.findMany({ orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }] })
}

export type WhyUsInput = {
  title: string
  description?: string
  icon?: string
  sortOrder?: number
  published?: boolean
}

export async function adminCreateWhyUs(input: WhyUsInput) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const row = await db.whyUsItem.create({
    data: {
      title: input.title.trim(),
      description: input.description?.trim() || null,
      icon: input.icon || null,
      sortOrder: input.sortOrder ?? 0,
      published: input.published ?? true,
    },
  })
  revalidatePath('/')
  return row
}

export async function adminUpdateWhyUs(id: string, input: Partial<WhyUsInput>) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const existing = await db.whyUsItem.findUnique({ where: { id } })
  if (!existing) throw new Error('Преимущество не найдено — возможно, было удалено. Обновите список.')
  const data: any = {}
  if (input.title !== undefined) data.title = input.title.trim()
  if (input.description !== undefined) data.description = input.description?.trim() || null
  if (input.icon !== undefined) data.icon = input.icon || null
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder
  if (input.published !== undefined) data.published = input.published
  let row
  try {
    row = await db.whyUsItem.update({ where: { id }, data })
  } catch (e) {
    throw wrapNotFoundError(e, 'Преимущество')
  }
  revalidatePath('/')
  return row
}

export async function adminDeleteWhyUs(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  try {
    await db.whyUsItem.delete({ where: { id } })
  } catch (e) {
    throw wrapNotFoundError(e, 'Преимущество')
  }
  revalidatePath('/')
}

// ───────────────────────────────────────────────
// СОЦИАЛЬНЫЕ СЕТИ
// ───────────────────────────────────────────────

export type SocialLinkPublic = {
  id: string
  name: string
  url: string
  icon: string | null
  iconImage: string | null
  sortOrder: number
}

function toSocialLinkPublic(s: any): SocialLinkPublic {
  return {
    id: s.id,
    name: s.name,
    url: s.url,
    icon: s.icon,
    iconImage: s.iconImage,
    sortOrder: s.sortOrder,
  }
}

export async function getPublishedSocialLinks(limit?: number): Promise<SocialLinkPublic[]> {
  const rows = await db.socialLink.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  })
  return rows.map(toSocialLinkPublic)
}

export async function adminListSocialLinks() {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const rows = await db.socialLink.findMany({
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  })
  return rows.map(toSocialLinkPublic)
}

export type SocialLinkInput = {
  name: string
  url: string
  icon?: string | null
  iconImage?: string | null
  sortOrder?: number
  published?: boolean
}

export async function adminCreateSocialLink(input: SocialLinkInput) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  if (!input.name?.trim()) throw new Error('Название обязательно')
  if (!input.url?.trim()) throw new Error('URL обязателен')
  const row = await db.socialLink.create({
    data: {
      name: input.name.trim(),
      url: input.url.trim(),
      icon: input.icon?.trim() || null,
      iconImage: input.iconImage?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      published: input.published ?? true,
    },
  })
  revalidatePath('/')
  return row
}

export async function adminUpdateSocialLink(id: string, input: Partial<SocialLinkInput>) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  const existing = await db.socialLink.findUnique({ where: { id } })
  if (!existing) throw new Error('Соцсеть не найдена — возможно, была удалена. Обновите список.')

  const data: any = {}
  if (input.name !== undefined) {
    if (!input.name.trim()) throw new Error('Название обязательно')
    data.name = input.name.trim()
  }
  if (input.url !== undefined) {
    if (!input.url.trim()) throw new Error('URL обязателен')
    data.url = input.url.trim()
  }
  if (input.icon !== undefined) data.icon = input.icon?.trim() || null
  if (input.iconImage !== undefined) data.iconImage = input.iconImage?.trim() || null
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder
  if (input.published !== undefined) data.published = input.published

  let row
  try {
    row = await db.socialLink.update({ where: { id }, data })
  } catch (e) {
    throw wrapNotFoundError(e, 'Соцсеть')
  }
  revalidatePath('/')
  return row
}

export async function adminDeleteSocialLink(id: string) {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  try {
    await db.socialLink.delete({ where: { id } })
  } catch (e) {
    throw wrapNotFoundError(e, 'Соцсеть')
  }
  revalidatePath('/')
}
