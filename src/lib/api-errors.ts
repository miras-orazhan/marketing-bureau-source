/**
 * Определяет HTTP-статус для ошибки, брошенной из lib-функций.
 *
 * Правила:
 *   - "Unauthorized" → 401
 *   - "не найден" / "not found" / P2025 → 404
 *   - "обязателен" / "слишком" / "длинное" → 400
 *   - всё остальное → 500
 */
export function httpStatusForError(e: unknown): number {
  const msg = e instanceof Error ? e.message : String(e)
  if (/unauthorized|no access/i.test(msg)) return 401
  if (/не найден|not found|p2025/i.test(msg)) return 404
  if (/обязател|некоррект|слишком|длинн|invalid|missing/i.test(msg)) return 400
  return 500
}

/**
 * Возвращает NextResponse с правильным статусом и сообщением об ошибке.
 */
export function errorResponse(e: unknown) {
  const status = httpStatusForError(e)
  const msg = e instanceof Error ? e.message : 'Внутренняя ошибка'
  return NextResponse.json({ ok: false, error: msg }, { status })
}

// Импортируем NextResponse здесь, чтобы не дублировать в каждом route.ts
import { NextResponse } from 'next/server'
