import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // В проде не логируем запросы — это сильно тормозит serverless-функции
    // на Vercel (каждый лог = синхронная I/O операция).
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Request-scoped cache для частых запросов.
 * В Next.js App Router server components переиспользуют один и тот же
 * module instance в рамках запроса, поэтому этот Map работает как
 * per-request кеш. После завершения запроса module переинициализируется.
 *
 * Используется в settings.ts и других местах, где один и тот же запрос
 * (например, getSiteSettings) выполняется 3 раза за render (viewport + metadata + layout body).
 *
 * Не используйте для изменяемых данных после мутаций — кеш не инвалидируется.
 */
const requestCache = new Map<string, Promise<unknown>>()

export async function withRequestCache<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key) as Promise<T>
  }
  const promise = fn()
  requestCache.set(key, promise)
  try {
    return await promise
  } catch (e) {
    // Если запрос упал — удаляем из кеша, чтобы следующий раз попробовал снова
    requestCache.delete(key)
    throw e
  }
}