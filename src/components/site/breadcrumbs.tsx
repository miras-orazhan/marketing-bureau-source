'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export type BreadcrumbItem = {
  /** Текст ссылки */
  label: string
  /** URL (если нет — текущая страница, не кликабельна) */
  href?: string
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  /** Цвет акцента для иконок/разделителей (по умолчанию muted-foreground) */
  accentColor?: string
  /** Показывать иконку "домик" перед первой крошкой */
  showHomeIcon?: boolean
}

/**
 * Хлебные крошки для публичной части сайта.
 *
 * Использование:
 *   <Breadcrumbs items={[
 *     { label: 'Главная', href: '/' },
 *     { label: 'Кейсы', href: '/?section=cases' },
 *     { label: 'Tehno Altyn' },  // текущая — без href
 *   ]} />
 *
 * Доступность (a11y):
 *   - nav с aria-label="Хлебные крошки"
 *   - ol/li семантика
 *   - aria-current="page" на текущей крошке
 *
 * SEO: микро-разметка schema.org BreadcrumbList добавлена в lib/schema.ts
 * (через JSON-LD), здесь только визуальная часть.
 */
export function Breadcrumbs({
  items,
  accentColor,
  showHomeIcon = true,
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Хлебные крошки" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          const isCurrent = isLast && !item.href
          const content = (
            <>
              {idx === 0 && showHomeIcon && (
                <Home
                  className="h-3.5 w-3.5 mr-1 inline-block align-text-bottom"
                  style={accentColor ? { color: accentColor } : undefined}
                  aria-hidden="true"
                />
              )}
              <span className={isCurrent ? 'text-foreground font-medium' : ''}>
                {item.label}
              </span>
            </>
          )

          return (
            <li key={idx} className="flex items-center gap-1 min-w-0">
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate"
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? 'page' : undefined}
                  className="truncate"
                >
                  {content}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className="h-3.5 w-3.5 mx-0.5 shrink-0 opacity-50"
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
