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

  return (
    <section id="hero" className="relative overflow-hidden isolate">
      {/* Фоновый слой.
          Если есть heroBackground — используем <img> с object-cover (а не CSS background-image),
          потому что <img> поддерживает srcset/sizes для адаптивной загрузки и лучше для LCP.
          Затемнение накладываем отдельным gradient-overlay поверх картинки.
          Если картинки нет или не загрузилась — fallback на gradient из настроек. */}
      <div className="absolute inset-0 -z-10">
        {showImage ? (
          <>
            <img
              src={settings.heroBackground!}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={() => setImageFailed(true)}
            />
            {/* Затемнение поверх картинки для читаемости текста */}
            <div
              className="absolute inset-0"
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: gradient }}
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
