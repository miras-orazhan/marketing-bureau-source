'use client'

import { Facebook, Twitter, Instagram, Youtube, Send, Mail, Phone, MapPin } from 'lucide-react'
import type { SiteSettingsPublic } from '@/lib/settings'
import type { SocialLinkPublic } from '@/lib/company-content'
import { DynamicIcon } from './dynamic-icon'

type FooterProps = {
  settings: SiteSettingsPublic
  /** Соцсети из БД (управляются через админку). Если пусто — fallback на старые поля settings. */
  socialLinks?: SocialLinkPublic[]
  onNavigate: (target: 'home' | 'services' | 'cases' | 'about' | 'blog' | 'news' | 'faq' | 'privacy') => void
  onAdminClick?: () => void
}

type SocialItem = {
  url: string
  name: string
  /** Приоритет: загруженное изображение > Lucide-иконка по имени > hardcoded-иконка */
  iconImage?: string | null
  iconName?: string | null
  fallbackIcon?: React.ReactNode
}

export function Footer({ settings, socialLinks, onNavigate, onAdminClick }: FooterProps) {
  const year = new Date().getFullYear()

  // ─── Готовим список соцсетей к рендеру ───
  const socials: SocialItem[] = []

  // 1) Если в БД есть управляемые соцсети — используем только их
  if (socialLinks && socialLinks.length > 0) {
    for (const s of socialLinks) {
      if (!s.url) continue
      socials.push({
        url: s.url,
        name: s.name,
        iconImage: s.iconImage,
        iconName: s.icon,
      })
    }
  } else {
    // 2) Fallback на старые захардкоженные поля SiteSettings
    const legacy: { url: string | null; icon: React.ReactNode; name: string }[] = [
      { url: settings.facebook, icon: <Facebook className="h-4 w-4" />, name: 'Facebook' },
      { url: settings.twitter, icon: <Twitter className="h-4 w-4" />, name: 'Twitter' },
      { url: settings.instagram, icon: <Instagram className="h-4 w-4" />, name: 'Instagram' },
      { url: settings.youtube, icon: <Youtube className="h-4 w-4" />, name: 'YouTube' },
      { url: settings.telegram, icon: <Send className="h-4 w-4" />, name: 'Telegram' },
    ]
    for (const s of legacy) {
      if (s.url) {
        socials.push({
          url: s.url,
          name: s.name,
          fallbackIcon: s.icon,
        })
      }
    }
  }

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* О сайте */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-lg font-semibold" style={{ color: settings.primaryColor }}>
              {settings.siteName}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {settings.aboutText || settings.metaDescription}
            </p>
            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {socials.map((s, i) => (
                  <a
                    key={`${s.name}-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors overflow-hidden"
                    aria-label={s.name}
                    title={s.name}
                  >
                    {/* Приоритет: загруженное изображение > Lucide-иконка по имени > fallback-иконка */}
                    {s.iconImage ? (
                      <img
                        src={s.iconImage}
                        alt={s.name}
                        className="h-full w-full object-cover"
                       loading="lazy" decoding="async" fetchPriority="auto" />
                    ) : s.iconName ? (
                      <DynamicIcon name={s.iconName} className="h-4 w-4" />
                    ) : (
                      s.fallbackIcon
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Навигация */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide">Навигация</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Главная', target: 'home' as const },
                { label: 'Услуги', target: 'services' as const },
                { label: 'Кейсы', target: 'cases' as const },
                { label: 'FAQ', target: 'faq' as const },
                { label: 'О нас', target: 'about' as const },
                { label: 'Блог', target: 'blog' as const },
              ].map((item) => (
                <li key={item.target}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.target)}
                    className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide">Контакты</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-foreground underline-offset-4 hover:underline">
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0" />
                  <a href={`tel:${settings.phone}`} className="hover:text-foreground underline-offset-4 hover:underline">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex items-start justify-between gap-4 text-xs text-muted-foreground">
          {/* Слева — copyright + Политика под ним */}
          <div className="text-left space-y-1">
            <p>{settings.footerText || `© ${year} ${settings.siteName}. Все права защищены.`}</p>
            <button
              type="button"
              onClick={() => onNavigate('privacy')}
              className="underline hover:text-foreground transition-colors"
            >
              Политика конфиденциальности
            </button>
          </div>
          {/* Справа — Войти, выровнен с верхней строкой */}
          {onAdminClick && (
            <button
              type="button"
              onClick={onAdminClick}
              className="text-muted-foreground/40 hover:text-muted-foreground transition-colors text-[10px]"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </footer>
  )
}
