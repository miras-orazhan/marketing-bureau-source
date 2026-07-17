import { Loader2 } from 'lucide-react'

/**
 * Loading UI для /cases/[slug] — показывается Next.js'ом пока
 * server component грузит данные кейса из БД.
 * Без этого пользователь видит пустой экран 1-3 сек.
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <div className="flex flex-col items-center justify-center text-muted-foreground gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Загрузка кейса…</p>
      </div>

      {/* Скелетон — имитация структуры страницы кейса */}
      <div className="mt-8 space-y-4 animate-pulse">
        <div className="h-10 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="aspect-[16/9] bg-muted rounded-lg mt-6" />
        <div className="space-y-2 mt-6">
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </div>
    </div>
  )
}
