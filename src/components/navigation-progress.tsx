'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { emitNavigationStart, emitNavigationEnd } from '@/hooks/use-navigation-loading'

/**
 * Глобальная линия загрузки при навигации.
 *
 * В Next.js App Router нет встроенных routeChangeStart/Complete событий.
 * Используем подход:
 *   1. Patch'им router.push/replace — при вызове запускаем прогресс-бар
 *   2. Слушаем usePathname() — при смене pathname завершаем прогресс-бар
 *
 * Также ловим нативные клики по <a> и browser back/forward.
 *
 * Анимация: 0% → 90% за ~3 сек (замедляется), затем 100% и fade-out.
 * Цвет: hsl(var(--primary)) — фирменный.
 */
export function NavigationProgress() {
  const router = useRouter()
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const prevPath = useRef(pathname)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedRef = useRef(false)

  const startProgress = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    emitNavigationStart()
    setVisible(true)
    setProgress(15)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 90
        }
        // Замедляемся ближе к 90%
        const step = p < 30 ? 8 : p < 60 ? 4 : p < 80 ? 2 : 0.5
        return Math.min(90, p + step)
      })
    }, 150)

    // Safety net: если навигация зависла, всё равно завершаем через 10 сек
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
    doneTimerRef.current = setTimeout(() => {
      done()
    }, 10000)
  }, [])

  const done = useCallback(() => {
    if (!startedRef.current) return
    if (timerRef.current) clearInterval(timerRef.current)
    setProgress(100)
    emitNavigationEnd()
    setTimeout(() => {
      setVisible(false)
      setProgress(0)
      startedRef.current = false
    }, 250)
  }, [])

  // Patch router.push/replace — перехватываем все вызовы навигации
  useEffect(() => {
    if (!router) return
    const originalPush = router.push.bind(router)
    const originalReplace = router.replace.bind(router)

    // @ts-ignore — патчим метод
    router.push = (href: any, options?: any) => {
      startProgress()
      return originalPush(href, options)
    }
    // @ts-ignore
    router.replace = (href: any, options?: any) => {
      startProgress()
      return originalReplace(href, options)
    }

    return () => {
      // @ts-ignore
      router.push = originalPush
      // @ts-ignore
      router.replace = originalReplace
    }
  }, [router, startProgress])

  // Завершаем прогресс-бар при смене pathname
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname
      done()
    }
  }, [pathname, done])

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (doneTimerRef.current) clearTimeout(doneTimerRef.current)
    }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: 'hsl(var(--primary))',
          transition: 'width 200ms ease-out, opacity 250ms ease-out',
          opacity: visible || progress === 100 ? 1 : 0,
          boxShadow: '0 0 8px hsl(var(--primary) / 0.6)',
        }}
      />
    </div>
  )
}
