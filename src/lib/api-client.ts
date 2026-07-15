'use client'

/**
 * Клиентский API-слой для админки.
 * Использует обычные fetch-запросы к /api/* эндпоинтам,
 * что надёжнее работает через preview-прокси, чем server actions.
 */

import type { SiteSettingsUpdate } from '@/lib/settings'
import type { ArticleInput } from '@/lib/articles'
import type { ServiceInput, CaseInput, FaqInput, ExpertiseInput, WhyUsInput, SocialLinkInput } from '@/lib/company-content'
import type { PageSlug, PageMetaUpdate } from '@/lib/page-meta'

async function parseResponse<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    return (await res.json()) as T
  }
  // Если ответ не JSON — пытаемся прочитать как текст
  const text = await res.text()
  throw new Error(text || `HTTP ${res.status}`)
}

export async function apiLogin(phone: string, password: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    })
    if (!res.ok) {
      const data = await parseResponse<{ ok: boolean; error?: string }>(res).catch(() => ({ error: '' }))
      return { ok: false, error: data?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка. Проверьте подключение.' }
  }
}

export async function apiForgotPassword(phone: string): Promise<{ ok: boolean; error?: string; message?: string; deepLink?: string; sent?: boolean }> {
  try {
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    if (!res.ok) {
      const data = await parseResponse<{ ok: boolean; error?: string }>(res).catch(() => ({ error: '' }))
      return { ok: false, error: data?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; message?: string; deepLink?: string; sent?: boolean }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

export async function apiResetPassword(token: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })
    if (!res.ok) {
      const data = await parseResponse<{ ok: boolean; error?: string }>(res).catch(() => ({ error: '' }))
      return { ok: false, error: data?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

// ───────────────────────────────────────────────
// УЧАСТНИКИ АДМИНКИ
// ───────────────────────────────────────────────

export async function apiListMembers(): Promise<any[]> {
  const res = await fetch('/api/members', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiCreateMember(input: {
  name: string
  phone: string
  password: string
  role?: string
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  return crudCreate('/api/members', input)
}

export async function apiUpdateMember(id: string, input: any): Promise<{ ok: boolean; error?: string }> {
  return crudUpdate(`/api/members/${id}`, input)
}

export async function apiDeleteMember(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/members/${id}`)
}

export async function apiLogout(): Promise<void> {
  try {
    await fetch('/api/logout', { method: 'POST' })
  } catch {
    // ignore
  }
}

export async function apiCheckSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/session', { cache: 'no-store' })
    if (!res.ok) return false
    const data = await res.json()
    return !!data?.isAdmin
  } catch {
    return false
  }
}

export async function apiGetSettings(): Promise<any> {
  const res = await fetch('/api/settings', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export async function apiUpdateSettings(data: SiteSettingsUpdate): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

export async function apiListArticles(type?: 'ARTICLE' | 'NEWS'): Promise<any[]> {
  const url = new URL('/api/articles', window.location.origin)
  if (type) url.searchParams.set('type', type)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiGetArticle(id: string): Promise<any | null> {
  const res = await fetch(`/api/articles/${id}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export async function apiCreateArticle(input: ArticleInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; id?: string; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

export async function apiUpdateArticle(
  id: string,
  input: Partial<ArticleInput>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

export async function apiDeleteArticle(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

export async function apiGetStats(): Promise<{
  articlesTotal: number
  articlesPublished: number
  newsTotal: number
  newsPublished: number
  totalViews: number
}> {
  const res = await fetch('/api/stats', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export async function apiChangePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

// ───────────────────────────────────────────────
// ПОСТРАНИЧНЫЕ SEO-МЕТАДАННЫЕ
// ───────────────────────────────────────────────

export async function apiListPageMeta(): Promise<any[]> {
  const res = await fetch('/api/page-meta', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiUpdatePageMeta(
  slug: PageSlug,
  data: PageMetaUpdate
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/page-meta?slug=${encodeURIComponent(slug)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

// ───────────────────────────────────────────────
// УСЛУГИ
// ───────────────────────────────────────────────

export async function apiListServices(): Promise<any[]> {
  const res = await fetch('/api/services', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiCreateService(input: ServiceInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  return crudCreate('/api/services', input)
}

export async function apiUpdateService(id: string, input: Partial<ServiceInput>): Promise<{ ok: boolean; error?: string }> {
  return crudUpdate(`/api/services/${id}`, input)
}

export async function apiDeleteService(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/services/${id}`)
}

// ───────────────────────────────────────────────
// КЕЙСЫ
// ───────────────────────────────────────────────

export async function apiListCases(): Promise<any[]> {
  const res = await fetch('/api/cases', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiCreateCase(input: CaseInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  return crudCreate('/api/cases', input)
}

export async function apiUpdateCase(id: string, input: Partial<CaseInput>): Promise<{ ok: boolean; error?: string }> {
  return crudUpdate(`/api/cases/${id}`, input)
}

export async function apiDeleteCase(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/cases/${id}`)
}

// ───────────────────────────────────────────────
// FAQ
// ───────────────────────────────────────────────

export async function apiListFaq(): Promise<any[]> {
  const res = await fetch('/api/faq', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiCreateFaq(input: FaqInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  return crudCreate('/api/faq', input)
}

export async function apiUpdateFaq(id: string, input: Partial<FaqInput>): Promise<{ ok: boolean; error?: string }> {
  return crudUpdate(`/api/faq/${id}`, input)
}

export async function apiDeleteFaq(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/faq/${id}`)
}

// ───────────────────────────────────────────────
// ЭКСПЕРТИЗА
// ───────────────────────────────────────────────

export async function apiListExpertise(): Promise<any[]> {
  const res = await fetch('/api/expertise', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiCreateExpertise(input: ExpertiseInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  return crudCreate('/api/expertise', input)
}

export async function apiUpdateExpertise(id: string, input: Partial<ExpertiseInput>): Promise<{ ok: boolean; error?: string }> {
  return crudUpdate(`/api/expertise/${id}`, input)
}

export async function apiDeleteExpertise(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/expertise/${id}`)
}

// ───────────────────────────────────────────────
// ПОЧЕМУ МЫ
// ───────────────────────────────────────────────

export async function apiListWhyUs(): Promise<any[]> {
  const res = await fetch('/api/why-us', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiCreateWhyUs(input: WhyUsInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  return crudCreate('/api/why-us', input)
}

export async function apiUpdateWhyUs(id: string, input: Partial<WhyUsInput>): Promise<{ ok: boolean; error?: string }> {
  return crudUpdate(`/api/why-us/${id}`, input)
}

export async function apiDeleteWhyUs(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/why-us/${id}`)
}

// ───────────────────────────────────────────────
// СОЦИАЛЬНЫЕ СЕТИ
// ───────────────────────────────────────────────

export async function apiListSocialLinks(): Promise<any[]> {
  const res = await fetch('/api/social-links', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiCreateSocialLink(input: SocialLinkInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  return crudCreate('/api/social-links', input)
}

export async function apiUpdateSocialLink(id: string, input: Partial<SocialLinkInput>): Promise<{ ok: boolean; error?: string }> {
  return crudUpdate(`/api/social-links/${id}`, input)
}

export async function apiDeleteSocialLink(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/social-links/${id}`)
}

// ───────────────────────────────────────────────
// ЗАЯВКИ (LEADS) — публичная отправка + админский список
// ───────────────────────────────────────────────

export async function apiSubmitLead(input: {
  name: string
  phone: string
  email?: string
  message?: string
  source?: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

export async function apiListLeads(): Promise<any[]> {
  const res = await fetch('/api/leads', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data?.items || []
}

export async function apiDeleteLead(id: string): Promise<{ ok: boolean; error?: string }> {
  return crudDelete(`/api/leads/${id}`)
}

// ───────────────────────────────────────────────
// ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
// ───────────────────────────────────────────────

export async function apiGetPrivacy(): Promise<any> {
  const res = await fetch('/api/privacy', { cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export async function apiUpdatePrivacy(data: {
  title?: string
  intro?: string | null
  content?: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/privacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

// ───────────────────────────────────────────────
// Вспомогательные CRUD-обёртки
// ───────────────────────────────────────────────

async function crudCreate(url: string, input: any): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; id?: string; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

async function crudUpdate(url: string, input: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}

async function crudDelete(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, { method: 'DELETE' })
    if (!res.ok) {
      const err: any = await parseResponse<any>(res).catch(() => ({}))
      return { ok: false, error: err?.error || `HTTP ${res.status}` }
    }
    return await parseResponse<{ ok: boolean; error?: string }>(res)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Сетевая ошибка' }
  }
}
