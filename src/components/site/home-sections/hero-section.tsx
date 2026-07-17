'use client'

import { useState } from 'react'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SiteSettingsPublic } from '@/lib/settings'

type HeroSectionProps = {
  settings: SiteSettingsPublic
  onCtaClick: () => void
}

export function HeroSection({ settings, onCtaClick }: HeroSectionProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const gradient = `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.accentColor} 100%)`
  const showImage = settings.heroBackground && !imageFailed

  // ОДИН фоновый слой: картинка + затемнение (rgba(0,0,0,0.5)) поверх неё в одном CSS-градиенте
  // Если изображения нет или оно не загрузилось — показываем только градиент брендинга
  const bg = showImage
    ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${settings.heroBackground}) center/cover no-repeat`
    : gradient

  return (
    <section id="hero" className="relative overflow-hidden isolate">
      {/* ОДИН фоновый блок: картинка + затемнение в одном CSS-градиенте */}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: bg }}
      >
        {settings.heroBackground && !imageFailed && (
           
          <img
            src={settings.heroBackground}
            alt="Фон главной страницы"
            className="hidden"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="container mx-auto px-4 py-24 md:py-36 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            {settings.heroTitle}
          </h1>
          <p className="text-base md:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl">
            {settings.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            {settings.heroCtaText && (
              <Button
                size="lg"
                onClick={onCtaClick}
                className="bg-white text-foreground hover:bg-white/90"
              >
                {settings.heroCtaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {settings.heroWhatsappLink && settings.heroWhatsappText && (
              <Button
                size="lg"
                asChild
                style={{ backgroundColor: settings.accentColor, color: '#fff' }}
                className="border-0 hover:opacity-90"
              >
                <a
                  href={settings.heroWhatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {settings.heroWhatsappText}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
