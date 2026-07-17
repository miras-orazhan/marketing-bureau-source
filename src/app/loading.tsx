import { Loader2 } from 'lucide-react'

/**
 * Корневой loading.tsx — показывается Next.js'ом при загрузке любой
 * страницы в app/ (главная, статьи, секции). Помогает при холодном старте
 * serverless-функции на Vercel — без этого пользователь видит пустой экран.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Загрузка…</p>
      </div>
    </div>
  )
}
