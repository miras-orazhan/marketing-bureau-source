/**
 * Skeleton главной страницы — показывается Next.js'ом пока сервер грузит данные.
 * Имитирует структуру главной: hero + 3 карточки экспертизы + grid услуг + footer.
 * Серый фон с пульсацией — стандартный паттерн loading-state.
 *
 * ВАЖНО: размеры блоков должны примерно совпадать с реальной главной,
 * чтобы избежать CLS (Cumulative Layout Shift) при замене skeleton на контент.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <header className="sticky top-0 z-40 w-full border-b bg-background h-16 flex items-center px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="hidden md:flex gap-4">
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* HERO skeleton */}
      <section className="relative py-24 md:py-36">
        <div className="absolute inset-0 -z-10 bg-muted animate-pulse" />
        <div className="container mx-auto px-4 text-white">
          <div className="max-w-3xl space-y-4">
            <div className="h-12 md:h-16 w-3/4 bg-white/20 rounded animate-pulse" />
            <div className="h-12 md:h-16 w-1/2 bg-white/20 rounded animate-pulse" />
            <div className="h-6 w-full bg-white/20 rounded animate-pulse" />
            <div className="h-6 w-5/6 bg-white/20 rounded animate-pulse" />
            <div className="flex gap-3 pt-4">
              <div className="h-10 w-48 bg-white/30 rounded animate-pulse" />
              <div className="h-10 w-48 bg-white/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Экспертиза skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="h-8 w-48 mx-auto bg-muted rounded animate-pulse" />
            <div className="h-4 w-3/4 mx-auto bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 rounded-lg border border-muted">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-muted rounded-lg animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-full bg-muted rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Услуги skeleton (упрощённо) */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 mx-auto bg-muted rounded animate-pulse mb-10" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-lg border bg-card space-y-3">
                <div className="h-12 w-12 bg-muted rounded-lg animate-pulse" />
                <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer skeleton */}
      <footer className="border-t bg-muted/30 mt-auto py-10">
        <div className="container mx-auto px-4">
          <div className="h-6 w-1/3 bg-muted rounded animate-pulse mb-4" />
          <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
        </div>
      </footer>
    </div>
  )
}
