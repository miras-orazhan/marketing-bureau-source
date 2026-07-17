'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Top progress bar — индикатор загрузки при навигации между страницами.
 *
 * Анимация запускается при смене pathname (через router.push или клик по Link).
 * Дойдёт до ~90% за 4 секунды, и до 100% при завершении (когда pathname применился).
 *
 * Лёгкий (один div + CSS), без сторонних зависимостей.
 * Стиль: фиксированная полоска вверху, цвета accentColor из CSS variable.
 */
export function NavigationProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const prevPath = useRef(pathname)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Если pathname не изменился — ничего не делаем
    if (prevPath.current === pathname) return

    // Запускаем прогресс
    prevPath.current = pathname
    setVisible(true)
    setProgress(15)

    // Плавно растим до 90% за ~1.5 сек
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 90
        }
        // Замедляемся ближе к 90%
        const step = p < 50 ? 8 : p < 75 ? 4 : 1
        return Math.min(90, p + step)
      })
    }, 120)

    // Через 600мс после старта — завершаем (новая страница обычно уже отрендерилась)
    const doneTimer = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current)
      setProgress(100)
      // Скрываем через 300мс после завершения
      setTimeout(() => {
        setVisible(false)
        setProgress(0)
      }, 300)
    }, 600)

    return () => {
      clearTimeout(doneTimer)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [pathname])

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
          transition: 'width 200ms ease-out, opacity 300ms ease-out',
          opacity: visible || progress === 100 ? 1 : 0,
          boxShadow: '0 0 8px hsl(var(--primary) / 0.6)',
        }}
      />
    </div>
  )
}
