import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export type ArticleListItem = {
  id: string
  type: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  published: boolean
  featured: boolean
  author: string | null
  tags: string[] | null
  viewCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export type ArticleFull = ArticleListItem & {
  content: string
}

function parseTags(tags: string | null | undefined): string[] | null {
  if (!tags) return null
  try {
    const parsed = JSON.parse(tags)
    if (Array.isArray(parsed)) return parsed.filter((t) => typeof t === 'string')
    return null
  } catch {
    // Если не JSON — попробуем запятую
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
}

function toListItem(a: any): ArticleListItem {
  return {
    id: a.id,
    type: a.type,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    published: a.published,
    featured: a.featured,
    author: a.author,
    tags: parseTags(a.tags),
    viewCount: a.viewCount,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    publishedAt: a.publishedAt,
  }
}

/**
 * Список опубликованных статей/новостей (для публичной части).
 */
export async function getPublishedArticles(
  type?: 'ARTICLE' | 'NEWS',
  opts: { limit?: number; featuredOnly?: boolean } = {}
): Promise<ArticleListItem[]> {
  const where: any = { published: true }
  if (type) where.type = type
  if (opts.featuredOnly) where.featured = true

  const rows = await db.article.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: opts.limit,
  })
  return rows.map(toListItem)
}

/**
 * Главная статья (featured). Берём первую попавшуюся featured,
 * если нет — последнюю опубликованную.
 */
export async function getFeaturedArticle(): Promise<ArticleListItem | null> {
  const rows = await db.article.findMany({
    where: { published: true, featured: true },
    orderBy: { publishedAt: 'desc' },
    take: 1,
  })
  if (rows.length > 0) return toListItem(rows[0])
  const latest = await db.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: 1,
  })
  return latest.length > 0 ? toListItem(latest[0]) : null
}

/**
 * Получить статью по slug (публичный доступ — только опубликованные).
 * Увеличивает счётчик просмотров.
 */
export async function getArticleBySlug(
  slug: string,
  incrementView = false
): Promise<ArticleFull | null> {
  const row = await db.article.findUnique({ where: { slug } })
  if (!row) return null

  if (incrementView) {
    // Инкрементируем асинхронно, не блокируя чтение
    try {
      await db.article.update({
        where: { id: row.id },
        data: { viewCount: { increment: 1 } },
      })
    } catch {
      // ignore
    }
  }

  return {
    ...toListItem(row),
    content: row.content,
  }
}

/**
 * Список всех статей/новостей (для админки — включая неопубликованные).
 * Требует прав администратора.
 */
export async function adminListArticles(type?: 'ARTICLE' | 'NEWS'): Promise<ArticleListItem[]> {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')

  const where: any = {}
  if (type) where.type = type

  const rows = await db.article.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })
  return rows.map(toListItem)
}

/**
 * Получить статью по ID (для админки).
 */
export async function adminGetArticle(id: string): Promise<ArticleFull | null> {
  const isOk = await isAdmin()
  if (!isOk) throw new Error('Unauthorized')
  const row = await db.article.findUnique({ where: { id } })
  if (!row) return null
  return {
    ...toListItem(row),
    content: row.content,
  }
}

export type ArticleInput = {
  type: 'ARTICLE' | 'NEWS'
  title: string
  slug?: string
  excerpt?: string
  content: string
  coverImage?: string
  published?: boolean
  featured?: boolean
  author?: string
  tags?: string[]
  publishedAt?: Date
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/giu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug || `post-${Date.now()}`
  let suffix = 1
   
  while (true) {
    const existing = await db.article.findUnique({ where: { slug: candidate } })
    if (!existing || existing.id === excludeId) return candidate
    suffix++
    candidate = `${slug}-${suffix}`
  }
}

export async function adminCreateArticle(input: ArticleInput): Promise<ArticleFull> {
  const isOk = await isAdmin()
  if (!isOk) throw new Error('Unauthorized')

  const slug = await ensureUniqueSlug(slugify(input.slug || input.title))
  const row = await db.article.create({
    data: {
      type: input.type,
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      coverImage: input.coverImage?.trim() || null,
      published: !!input.published,
      featured: !!input.featured,
      author: input.author?.trim() || null,
      tags: input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null,
      publishedAt: input.published ? input.publishedAt || new Date() : null,
    },
  })
  revalidatePath('/')
  return {
    ...toListItem(row),
    content: row.content,
  }
}

export async function adminUpdateArticle(
  id: string,
  input: Partial<ArticleInput>
): Promise<ArticleFull> {
  const isOk = await isAdmin()
  if (!isOk) throw new Error('Unauthorized')

  const existing = await db.article.findUnique({ where: { id } })
  if (!existing) throw new Error('Article not found')

  let newSlug = existing.slug
  if (input.slug !== undefined && input.slug !== existing.slug) {
    newSlug = await ensureUniqueSlug(slugify(input.slug || existing.title), id)
  }

  const data: any = {}
  if (input.type !== undefined) data.type = input.type
  if (input.title !== undefined) data.title = input.title.trim()
  if (input.slug !== undefined) data.slug = newSlug
  if (input.excerpt !== undefined) data.excerpt = input.excerpt?.trim() || null
  if (input.content !== undefined) data.content = input.content
  if (input.coverImage !== undefined) data.coverImage = input.coverImage?.trim() || null
  if (input.published !== undefined) data.published = !!input.published
  if (input.featured !== undefined) data.featured = !!input.featured
  if (input.author !== undefined) data.author = input.author?.trim() || null
  if (input.tags !== undefined) {
    data.tags = input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null
  }
  if (input.published !== undefined) {
    if (input.published && !existing.publishedAt) {
      data.publishedAt = input.publishedAt || new Date()
    } else if (!input.published) {
      data.publishedAt = null
    } else if (input.publishedAt) {
      data.publishedAt = input.publishedAt
    }
  }

  const row = await db.article.update({ where: { id }, data })
  revalidatePath('/')
  return {
    ...toListItem(row),
    content: row.content,
  }
}

export async function adminDeleteArticle(id: string): Promise<void> {
  const isOk = await isAdmin()
  if (!isOk) throw new Error('Unauthorized')
  await db.article.delete({ where: { id } })
  revalidatePath('/')
}

/**
 * Сводная статистика для дашборда админки.
 */
export async function adminGetStats(): Promise<{
  articlesTotal: number
  articlesPublished: number
  newsTotal: number
  newsPublished: number
  totalViews: number
}> {
  const isOk = await isAdmin()
  if (!isOk) throw new Error('Unauthorized')

  const [articlesTotal, articlesPublished, newsTotal, newsPublished, viewsAgg] =
    await Promise.all([
      db.article.count({ where: { type: 'ARTICLE' } }),
      db.article.count({ where: { type: 'ARTICLE', published: true } }),
      db.article.count({ where: { type: 'NEWS' } }),
      db.article.count({ where: { type: 'NEWS', published: true } }),
      db.article.aggregate({ _sum: { viewCount: true } }),
    ])

  return {
    articlesTotal,
    articlesPublished,
    newsTotal,
    newsPublished,
    totalViews: viewsAgg._sum.viewCount || 0,
  }
}
