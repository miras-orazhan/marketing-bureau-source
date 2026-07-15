import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/auth'

/**
 * POST /api/upload
 * Загрузка изображения (multipart/form-data, поле "file").
 * Сохраняет файл в БД (таблица UploadedFile) и возвращает { url, filename }.
 * Доступ: только админ. Публичная раздача — через GET /uploads/[filename].
 *
 * Лимиты:
 *   - только изображения (image/*)
 *   - до 10 МБ
 */
export async function POST(req: NextRequest) {
  // Авторизация — только админ может загружать файлы
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData().catch(() => null)
    if (!formData) {
      return NextResponse.json(
        { ok: false, error: 'Ожидается multipart/form-data' },
        { status: 400 }
      )
    }

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'Файл не передан (поле "file")' },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { ok: false, error: 'Файл пустой' },
        { status: 400 }
      )
    }

    // 10 МБ
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: 'Файл слишком большой (макс. 10 МБ)' },
        { status: 400 }
      )
    }

    // Проверка MIME
    const mimeType = file.type || 'application/octet-stream'
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { ok: false, error: 'Допускаются только изображения (PNG, JPEG, WebP, GIF, SVG)' },
        { status: 400 }
      )
    }

    // Расширение из имени файла или из MIME
    const extFromName = (file.name.split('.').pop() || '').toLowerCase()
    const extByMime: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
    }
    const ext = extFromName || extByMime[mimeType] || 'bin'

    // Уникальное имя файла: timestamp + случайный суффикс
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    // Сохраняем в БД
    await db.uploadedFile.create({
      data: {
        filename: unique,
        mimeType,
        data: buffer,
        size: buffer.length,
      },
    })

    return NextResponse.json({
      ok: true,
      url: `/uploads/${unique}`,
      filename: unique,
    })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json(
      { ok: false, error: e?.message || 'Внутренняя ошибка' },
      { status: 500 }
    )
  }
}
