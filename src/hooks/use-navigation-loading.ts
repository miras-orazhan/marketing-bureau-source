'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Hook для отслеживания идёт ли сейчас навигация.
 *
 * Логика:
 *   - При клике на Link/router.push pathname остаётся прежним, но переход начался.
 *     Мы не можем это поймать напрямую в App Router (нет routeChangeStart).
 *   - Поэтому используем общий event-канал: NavigationProgress компонент
 *     триггерит window-событие 'navigation-start' при начале навигации,
 *     'navigation-end' при завершении (через pathname change).
 *
 * Возвращаемое значение:
 *   - true — навигация идёт, кнопки должны быть disabled
 *   - false — навигация завершена, можно кликать
 *
 * Использование:
 *   const isLoading = useNavigationLoading()
 *   <button disabled={isLoading} onClick={...}>...</button>
 */
export function useNavigationLoading(): boolean {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onStart = () => setLoading(true)
    const onEnd = () => setLoading(false)

    window.addEventListener('navigation-start', onStart)
    window.addEventListener('navigation-end', onEnd)

    // При смене pathname — навигация завершена
    return () => {
      window.removeEventListener('navigation-start', onStart)
      window.removeEventListener('navigation-end', onEnd)
    }
  }, [])

  // pathname сменился → навигация завершена
  useEffect(() => {
    setLoading(false)
  }, [pathname])

  return loading
}

/**
 * Программно триггерить событие начала навигации.
 * Используется в NavigationProgress при patch router.push.
 */
export function emitNavigationStart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('navigation-start'))
  }
}

/**
 * Программно триггерить событие завершения навигации.
 */
export function emitNavigationEnd() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('navigation-end'))
  }
}
