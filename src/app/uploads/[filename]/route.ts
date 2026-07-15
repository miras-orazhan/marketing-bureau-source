import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { db } from '@/lib/db'

type Params = { params: Promise<{ filename: string }> }

/**
 * Директории-источники для fallback-чтения файлов из ФС
 * (если они ещё не импортированы в БД).
 *
 * ВАЖНО: никаких абсолютных путей — только относительные от cwd проекта,
 * чтобы работало и в sandbox, и на Vercel, и в любой другой среде.
 */
const UPLOAD_DIRS = [
  path.join(process.cwd(), 'public', 'uploads'), // legacy: файлы, загружённые до миграции в БД
  path.join(process.cwd(), 'upload'), // paste-image / agent-browser (sandbox)
]

function mimeFromExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'webp': return 'image/webp'
    case 'gif': return 'image/gif'
    case 'svg': return 'image/svg+xml'
    default: return 'application/octet-stream'
  }
}

/**
 * GET /uploads/[filename]
 * Отдаёт изображение:
 *   1. Из БД (таблица UploadedFile) — основной источник (работает везде,
 *      включая Vercel serverless).
 *   2. Из файловой системы (public/uploads/ или upload/) — fallback
 *      для файлов, загружённых мимо /api/upload.
 *
 * Если файл найден в ФС, но не в БД — автоматически импортирует его в БД
 * (чтобы последующие запросы шли из БД быстро).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const { filename } = await params

  // 1. Ищем в БД
  const file = await db.uploadedFile.findUnique({ where: { filename } })
  if (file) {
    return new NextResponse(file.data, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Length': String(file.size),
        'Cache-Control': 'public, max-age=2592000, immutable',
      },
    })
  }

  // 2. Fallback: ищем в файловой системе (только для локали / preview —
  //    на Vercel ФС read-only и эти папки обычно пустые).
  for (const dir of UPLOAD_DIRS) {
    const filePath = path.join(dir, filename)
    try {
      const stat = await fs.stat(filePath)
      if (!stat.isFile()) continue

      const data = await fs.readFile(filePath)
      const ext = (filename.split('.').pop() || '').toLowerCase()
      const mimeType = mimeFromExt(ext)

      // Асинхронно импортируем в БД (без блокировки ответа)
      db.uploadedFile
        .create({
          data: {
            filename,
            mimeType,
            data: Buffer.from(data),
            size: data.length,
          },
        })
        .catch(() => {
          // ignore — возможно уже создан параллельным запросом
        })

      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(data.length),
          'Cache-Control': 'public, max-age=2592000, immutable',
        },
      })
    } catch {
      // файла нет в этой директории — пробуем следующую
      continue
    }
  }

  return new NextResponse('Not Found', { status: 404 })
}
