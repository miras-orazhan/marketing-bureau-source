/**
 * Корневой loading.tsx — показывается Next.js'ом при загрузке любой
 * страницы в app/. Должен быть ЛЁГКИМ и БЫСТРЫМ — это fallback для
 * streaming SSR, который отдаётся немедленно, пока server component
 * грузит данные.
 *
 * ВАЖНО: не нагружать этот skeleton сложной структурой — он сам рендерится
 * на сервере и должен занимать <50мс. Чем проще — тем лучше для TTFB.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header skeleton — минимальный */}
      <header className="h-16 border-b bg-background flex items-center px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="hidden md:flex gap-4">
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Контент — простой centered spinner, не имитирующий структуру */}
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="h-8 w-8 border-2 border-muted border-t-foreground rounded-full animate-spin" />
          <p className="text-sm">Загрузка…</p>
        </div>
      </main>

      {/* Footer skeleton — минимальный */}
      <footer className="h-20 border-t bg-muted/30" />
    </div>
  )
}
