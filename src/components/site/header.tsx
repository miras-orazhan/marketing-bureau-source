'use client'

import { useMemo, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { SiteSettingsPublic } from '@/lib/settings'

type NavTarget = 'home' | 'services' | 'cases' | 'about' | 'blog' | 'faq'

const NAV_LABELS: Record<NavTarget, string> = {
  home: 'Главная',
  services: 'Услуги',
  cases: 'Кейсы',
  about: 'О нас',
  blog: 'Блог',
  faq: 'FAQ',
}

type HeaderProps = {
  settings: SiteSettingsPublic
  navItems: NavTarget[]
  onNavigate: (target: NavTarget) => void
}

export function Header({ settings, navItems, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const LogoEl = useMemo(() => {
    if (settings.logoUrl) {
      return (
        // width/height нужны для предотвращения CLS: браузер резервирует место
        // под картинку ДО её загрузки. h-10 в CSS = 40px, ширина вычисляется
        // автоматически через aspect-ratio (по intrinsic размерам PNG).
        <img
          src={settings.logoUrl}
          alt={settings.siteName}
          width={180}
          height={40}
          className="h-10 w-auto max-w-[180px] object-contain"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      )
    }
    return (
      <span
        className="text-xl font-bold tracking-tight"
        style={{ color: settings.primaryColor }}
      >
        {settings.logoText || settings.siteName}
      </span>
    )
  }, [settings.logoUrl, settings.logoText, settings.siteName, settings.primaryColor])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={() => {
            onNavigate('home')
            setMobileOpen(false)
          }}
          className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
          aria-label={settings.siteName}
        >
          {LogoEl}
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="default"
              onClick={() => onNavigate(item)}
              className="text-sm min-h-[44px]"
            >
              {NAV_LABELS[item]}
            </Button>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden min-h-[44px] min-w-[44px]"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Меню"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div
        className={cn(
          'md:hidden border-t bg-background overflow-hidden transition-all',
          mobileOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <nav className="container mx-auto flex flex-col p-4 gap-1">
          {navItems.map((item) => (
            <Button
              key={item}
              variant="ghost"
              size="default"
              className="justify-start min-h-[44px]"
              onClick={() => {
                onNavigate(item)
                setMobileOpen(false)
              }}
            >
              {NAV_LABELS[item]}
            </Button>
          ))}
        </nav>
      </div>
    </header>
  )
}
