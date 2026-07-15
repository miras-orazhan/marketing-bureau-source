'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Crumb = {
  label: string
  onClick?: () => void
}

type BreadcrumbsProps = {
  items: Crumb[]
  className?: string
}

/**
 * Хлебные крошки для админки.
 * Последний элемент — текущая страница (не кликабельный).
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Хлебные крошки" className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1
        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
            {isLast || !item.onClick ? (
              <span className={isLast ? 'font-medium text-foreground' : ''}>
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                {item.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
