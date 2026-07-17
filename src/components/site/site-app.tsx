'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import type { SiteSettingsPublic } from '@/lib/settings'
import type { ArticleListItem, ArticleFull } from '@/lib/articles'
import type {
  ServicePublic,
  CasePublic,
  FaqPublic,
  ExpertisePublic,
  WhyUsPublic,
  SocialLinkPublic,
} from '@/lib/company-content'
import type { EffectivePageMeta } from '@/lib/page-meta'
import { Header } from './header'
import { Footer } from './footer'
import { AdminPanel } from '@/components/admin/admin-panel'
import { AdminLogin } from '@/components/admin/admin-login'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

import { HeroSection } from './home-sections/hero-section'
import { ExpertiseSection } from './home-sections/expertise-section'
import { ServicesSection } from './home-sections/services-section'
import { WhyUsSection } from './home-sections/why-us-section'
import { CasesSection } from './home-sections/cases-section'
import { FaqSection } from './home-sections/faq-section'
import { CtaSection } from './home-sections/cta-section'

import { ArticleListPage } from './article-list-page'
import { ArticleDetail } from './article-detail'
import { ServicesPage } from './services-page'
import { CasesPage } from './cases-page'
import { CaseDetail } from './case-detail'
import { FaqPage } from './faq-page'
import { PrivacyPage } from './privacy-page'

type View =
  | 'home'
  | 'services'
  | 'cases'
  | 'about'
  | 'blog'
  | 'faq'
  | 'privacy'
  | 'news'
  | 'admin'
  | 'reset'
  | 'article'
  | 'case'

type SiteAppProps = {
  settings: SiteSettingsPublic
  isAdmin: boolean
  pageMeta: EffectivePageMeta
  initialView: View
  articleSlug: string | null
  resetToken: string | null
  articleData: ArticleFull | null
  related: ArticleListItem[]
  featured: ArticleListItem | null
  articles: ArticleListItem[]
  news: ArticleListItem[]
  services: ServicePublic[]
  cases: CasePublic[]
  faq: FaqPublic[]
  expertise: ExpertisePublic[]
  whyUs: WhyUsPublic[]
  privacyContent: { title: string; intro: string | null; content: string; updatedAt: string }
  socialLinks: SocialLinkPublic[]
  caseSlug: string | null
  caseData: CasePublic | null
  relatedCases: CasePublic[]
}

export function SiteApp({
  settings,
  isAdmin,
  pageMeta,
  initialView,
  articleSlug,
  resetToken,
  articleData,
  related,
  featured,
  articles,
  news,
  services,
  cases,
  faq,
  expertise,
  whyUs,
  privacyContent,
  socialLinks,
  caseSlug,
  caseData,
  relatedCases,
}: SiteAppProps) {
  const router = useRouter()
  const [view, setView] = useState<View>(initialView)

  useEffect(() => {
    setView(initialView)
  }, [initialView])

  const pushUrl = useCallback(
    (params: Record<string, string | undefined>) => {
      const url = new URL(window.location.href)
      Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === '') url.searchParams.delete(k)
        else url.searchParams.set(k, v)
      })
      router.push(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
    },
    [router]
  )

  const navigateTo = useCallback(
    (target: 'home' | 'services' | 'cases' | 'about' | 'blog' | 'news' | 'faq' | 'privacy') => {
      pushUrl({
        view: undefined,
        article: undefined,
        section: target === 'home' ? undefined : target,
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [pushUrl]
  )

  const openArticle = useCallback(
    (slug: string) => {
      pushUrl({ section: undefined, view: undefined, article: slug, case: undefined })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [pushUrl]
  )

  const openCase = useCallback(
    (slug: string) => {
      // Чистый URL: /cases/<slug> вместо ?case=<slug>
      router.push(`/cases/${slug}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [router]
  )

  const goCases = useCallback(() => {
    // Можно напрямую на /cases (там редирект на ?section=cases),
    // но используем pushUrl чтобы остаться в SPA-навигации.
    pushUrl({ section: 'cases', view: undefined, article: undefined, case: undefined })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pushUrl])

  const openAdmin = useCallback(() => {
    pushUrl({ section: undefined, article: undefined, view: 'admin' })
  }, [pushUrl])

  const exitAdmin = useCallback(() => {
    pushUrl({ view: undefined })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pushUrl])

  const goHome = useCallback(() => {
    pushUrl({ section: undefined, article: undefined, view: undefined, case: undefined })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pushUrl])

  const scrollToCta = useCallback(() => {
    const el = document.getElementById('cta')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ─── РЕЖИМ СБРОСА ПАРОЛЯ ───────────────────────────────────
  if (view === 'reset') {
    return (
      <AdminLogin
        onBack={goHome}
        mode="reset"
        resetToken={resetToken || undefined}
      />
    )
  }

  // ─── АДМИНСКИЙ РЕЖИМ ───────────────────────────────────────
  if (view === 'admin') {
    if (!isAdmin) {
      return <AdminLogin onBack={exitAdmin} />
    }
    return <AdminPanel onExit={exitAdmin} />
  }

  // ─── ПУБЛИЧНЫЙ РЕЖИМ ───────────────────────────────────────
  const headerNavTargets: ('home' | 'services' | 'cases' | 'about' | 'blog' | 'faq')[] = [
    'home',
    'services',
    'cases',
    'about',
    'faq',
    'blog',
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: settings.backgroundColor }}>
      <Header
        settings={settings}
        navItems={headerNavTargets}
        onNavigate={(t) => navigateTo(t as any)}
      />

      <main id="main-content" className="flex-1">
        {/* ГЛАВНАЯ: 7 секций */}
        {view === 'home' && (
          <>
            <HeroSection settings={settings} onCtaClick={scrollToCta} />
            <ExpertiseSection settings={settings} items={expertise} />
            <ServicesSection
              settings={settings}
              items={services}
              onSeeAll={() => navigateTo('services')}
            />
            <WhyUsSection settings={settings} items={whyUs} />
            <CasesSection
              settings={settings}
              items={cases}
              onSeeAll={() => navigateTo('cases')}
              onOpenCase={openCase}
            />
            <FaqSection settings={settings} items={faq} />
            <CtaSection settings={settings} />
          </>
        )}

        {/* УСЛУГИ */}
        {view === 'services' && (
          <ServicesPage
            settings={settings}
            items={services}
            onContact={scrollToCta}
          />
        )}

        {/* КЕЙСЫ */}
        {view === 'cases' && (
          <CasesPage
            settings={settings}
            items={cases}
            onContact={scrollToCta}
            onOpenCase={openCase}
          />
        )}

        {/* КЕЙС (детальная страница) */}
        {view === 'case' && caseData && (
          <CaseDetail
            caseItem={caseData}
            settings={settings}
            related={relatedCases}
            onBack={goCases}
            onOpen={openCase}
          />
        )}

        {view === 'case' && !caseData && (
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold mb-3">Кейс не найден</h1>
            <p className="text-muted-foreground mb-6">
              Возможно, он был удалён или снят с публикации.
            </p>
            <Button onClick={goCases}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Все кейсы
            </Button>
          </div>
        )}

        {/* FAQ (отдельная страница) */}
        {view === 'faq' && (
          <FaqPage settings={settings} items={faq} onContact={scrollToCta} />
        )}

        {/* ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ */}
        {view === 'privacy' && (
          <PrivacyPage settings={settings} content={privacyContent} />
        )}

        {/* О НАС */}
        {view === 'about' && (
          <div className="container mx-auto px-4 py-16 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: settings.primaryColor }}>
              О нас
            </h1>
            {settings.aboutContent ? (
              <div
                className="article-content prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: settings.aboutContent }}
              />
            ) : (
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-muted-foreground leading-relaxed">
                  {settings.aboutText || settings.metaDescription}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {settings.email && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{settings.email}</p>
                </div>
              )}
              {settings.phone && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Телефон</p>
                  <p className="font-medium">{settings.phone}</p>
                </div>
              )}
              {settings.address && (
                <div className="border rounded-lg p-4 sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Адрес</p>
                  <p className="font-medium">{settings.address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA-баннер на about */}
        {view === 'about' && (
          <CtaSection settings={settings} source="about-cta" />
        )}

        {/* БЛОГ (статьи) */}
        {view === 'blog' && (
          <ArticleListPage
            title="Блог"
            description="Статьи о маркетинге, кейсах и трендах"
            items={articles}
            settings={settings}
            onOpenArticle={openArticle}
            type="ARTICLE"
          />
        )}

        {/* CTA-баннер на blog — после списка статей */}
        {view === 'blog' && (
          <CtaSection settings={settings} source="blog-cta" />
        )}

        {/* СТАТЬЯ (детальная) */}
        {view === 'article' && articleData && (
          <ArticleDetail
            article={articleData}
            settings={settings}
            related={related}
            onBack={goHome}
            onOpen={openArticle}
          />
        )}

        {view === 'article' && !articleData && (
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold mb-3">Материал не найден</h1>
            <p className="text-muted-foreground mb-6">
              Возможно, он был удалён или снят с публикации.
            </p>
            <Button onClick={goHome}>
              <ArrowLeft className="h-4 w-4 mr-1" /> На главную
            </Button>
          </div>
        )}
      </main>

      <Footer
        settings={settings}
        socialLinks={socialLinks}
        onNavigate={(t) => navigateTo(t as any)}
        onAdminClick={openAdmin}
      />
    </div>
  )
}
