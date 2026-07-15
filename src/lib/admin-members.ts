import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'
import { hashPassword, verifyPassword } from '@/lib/auth'
import crypto from 'crypto'

export type AdminMemberPublic = {
  id: string
  name: string
  phone: string
  telegramChatId: string | null
  role: string
  published: boolean
  createdAt: string
}

export type AdminMemberInput = {
  name: string
  phone: string
  password?: string  // при создании обязательно, при обновлении опционально
  role?: string
  published?: boolean
}

function normalizePhone(p: string): string {
  return p.replace(/[\s\-\(\)]/g, '').trim()
}

function toPublic(m: any): AdminMemberPublic {
  return {
    id: m.id,
    name: m.name,
    phone: m.phone,
    telegramChatId: m.telegramChatId,
    role: m.role,
    published: m.published,
    createdAt: m.createdAt.toISOString(),
  }
}

export async function listMembers(): Promise<AdminMemberPublic[]> {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')

  // Сначала получаем главного админа из SiteSettings
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  const result: AdminMemberPublic[] = []

  if (settings) {
    result.push({
      id: '__main_admin__',
      name: 'Главный администратор',
      phone: settings.adminPhone,
      telegramChatId: null,
      role: 'owner',
      published: true,
      createdAt: new Date(0).toISOString(),
    })
  }

  // Затем участников
  const rows = await db.adminMember.findMany({ orderBy: { createdAt: 'desc' } })
  result.push(...rows.map(toPublic))

  return result
}

export async function createMember(input: AdminMemberInput): Promise<AdminMemberPublic> {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  if (!input.name?.trim()) throw new Error('Имя обязательно')
  if (!input.phone?.trim()) throw new Error('Телефон обязателен')
  if (!input.password?.trim() || input.password.length < 4) throw new Error('Пароль минимум 4 символа')

  const phone = normalizePhone(input.phone)
  const existing = await db.adminMember.findUnique({ where: { phone } })
  if (existing) throw new Error('Участник с таким телефоном уже существует')

  const row = await db.adminMember.create({
    data: {
      name: input.name.trim(),
      phone,
      passwordHash: hashPassword(input.password),
      role: input.role || 'admin',
      published: input.published ?? true,
    },
  })
  return toPublic(row)
}

export async function updateMember(id: string, input: Partial<AdminMemberInput> & { telegramChatId?: string | null }): Promise<AdminMemberPublic> {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')

  const existing = await db.adminMember.findUnique({ where: { id } })
  if (!existing) throw new Error('Участник не найден')

  const data: any = {}
  if (input.name !== undefined) data.name = input.name.trim()
  if (input.phone !== undefined) {
    const phone = normalizePhone(input.phone)
    const dupe = await db.adminMember.findUnique({ where: { phone } })
    if (dupe && dupe.id !== id) throw new Error('Этот телефон уже занят')
    data.phone = phone
  }
  if (input.password !== undefined && input.password.trim()) {
    if (input.password.length < 4) throw new Error('Пароль минимум 4 символа')
    data.passwordHash = hashPassword(input.password)
  }
  if (input.role !== undefined) data.role = input.role
  if (input.published !== undefined) data.published = input.published
  if (input.telegramChatId !== undefined) data.telegramChatId = input.telegramChatId || null

  const row = await db.adminMember.update({ where: { id }, data })
  return toPublic(row)
}

export async function deleteMember(id: string): Promise<void> {
  const ok = await isAdmin()
  if (!ok) throw new Error('Unauthorized')
  await db.adminMember.delete({ where: { id } })
}

/**
 * Проверяет телефон + пароль по всем участникам И по главному админу (SiteSettings).
 * Возвращает true если найден хоть один.
 */
export async function verifyAnyCredentials(phone: string, password: string): Promise<boolean> {
  const normPhone = normalizePhone(phone)

  // 1. Проверяем участников
  const member = await db.adminMember.findUnique({
    where: { phone: normPhone },
  })
  if (member && member.published) {
    if (verifyPassword(password, member.passwordHash)) return true
  }

  // 2. Проверяем главного админа (SiteSettings)
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (settings) {
    if (normalizePhone(settings.adminPhone) === normPhone) {
      if (verifyPassword(password, settings.adminPasswordHash)) return true
    }
  }

  return false
}

/**
 * Находит участника или главного админа по телефону.
 * Возвращает { type: 'member' | 'admin', phone, telegramChatId } или null.
 */
export async function findUserByPhone(phone: string): Promise<{ type: string; phone: string; telegramChatId: string | null } | null> {
  const normPhone = normalizePhone(phone)

  // 1. Участники
  const member = await db.adminMember.findUnique({ where: { phone: normPhone } })
  if (member) {
    return { type: 'member', phone: member.phone, telegramChatId: member.telegramChatId }
  }

  // 2. Главный админ
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (settings && normalizePhone(settings.adminPhone) === normPhone) {
    return { type: 'admin', phone: settings.adminPhone, telegramChatId: null }
  }

  return null
}

/**
 * Создаёт токен сброса для участника или главного админа.
 * Возвращает { token, expires, telegramChatId } или null.
 */
export async function createResetTokenForPhone(phone: string): Promise<{ token: string; expires: Date; telegramChatId: string | null } | null> {
  const normPhone = normalizePhone(phone)
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 30 * 60 * 1000)

  // 1. Участник
  const member = await db.adminMember.findUnique({ where: { phone: normPhone } })
  if (member) {
    await db.adminMember.update({
      where: { id: member.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    })
    return { token, expires, telegramChatId: member.telegramChatId }
  }

  // 2. Главный админ (SiteSettings)
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (settings && normalizePhone(settings.adminPhone) === normPhone) {
    await db.siteSettings.update({
      where: { id: 'default' },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    })
    return { token, expires, telegramChatId: null }
  }

  return null
}

/**
 * Сброс пароля по токену — проверяет и участников, и главного админа.
 */
export async function resetPasswordWithTokenUniversal(token: string, newPassword: string): Promise<boolean> {
  if (newPassword.length < 4) return false

  // 1. Участники
  const member = await db.adminMember.findFirst({
    where: { passwordResetToken: token },
  })
  if (member) {
    if (member.passwordResetExpires && new Date() < member.passwordResetExpires) {
      await db.adminMember.update({
        where: { id: member.id },
        data: {
          passwordHash: hashPassword(newPassword),
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      })
      return true
    }
  }

  // 2. Главный админ
  const settings = await db.siteSettings.findUnique({ where: { id: 'default' } })
  if (settings?.passwordResetToken && settings.passwordResetToken === token) {
    if (settings.passwordResetExpires && new Date() < settings.passwordResetExpires) {
      await db.siteSettings.update({
        where: { id: 'default' },
        data: {
          adminPasswordHash: hashPassword(newPassword),
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      })
      return true
    }
  }

  return false
}
