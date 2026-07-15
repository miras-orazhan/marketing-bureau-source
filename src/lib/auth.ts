import crypto from 'crypto'

/**
 * Хэширование пароля с использованием sha256 + соли (приложение).
 * Для production лучше использовать bcrypt, но в sandbox-среде
 * достаточно sha256 с фиксированной солью.
 */
const SALT = 'cms-portal-salt-v1'

export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(SALT + password)
    .digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

/**
 * Проверяет, авторизован ли администратор, по подписанной cookie.
 */
import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'cms-admin-token'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cms-portal-secret-v1'

export function createAdminToken(): string {
  // Простой подписанный токен: hash(secret + timestamp) + timestamp
  const ts = Date.now().toString()
  const sig = crypto
    .createHash('sha256')
    .update(ADMIN_SECRET + ts)
    .digest('hex')
  return `${ts}.${sig}`
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [ts, sig] = parts
  const expectedSig = crypto
    .createHash('sha256')
    .update(ADMIN_SECRET + ts)
    .digest('hex')
  if (sig !== expectedSig) return false
  // Токен действителен 7 дней
  const tsNum = parseInt(ts, 10)
  if (isNaN(tsNum)) return false
  const age = Date.now() - tsNum
  return age < 7 * 24 * 60 * 60 * 1000
}

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  return verifyAdminToken(token)
}

export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE
