'use client'

import type { SiteSettingsPublic } from '@/lib/settings'

type PrivacyContent = {
  title: string
  intro: string | null
  content: string
  updatedAt: string
}

type PrivacyPageProps = {
  settings: SiteSettingsPublic
  content: PrivacyContent
}

export function PrivacyPage({ settings, content }: PrivacyPageProps) {
  const updatedDate = new Date(content.updatedAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: settings.primaryColor }}>
          {content.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Последнее обновление: {updatedDate}
        </p>
      </header>

      {content.intro && (
        <div className="prose prose-sm md:prose-base max-w-none mb-8 text-foreground/90 leading-relaxed">
          <p>{content.intro}</p>
        </div>
      )}

      <div
        className="article-content prose prose-sm md:prose-base max-w-none"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
    </div>
  )
}
