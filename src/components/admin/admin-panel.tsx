'use client'

import { useState } from 'react'
import { AdminSidebar, type AdminTab } from './admin-sidebar'
import { ArticlesManager } from './articles-manager'
import { SiteSettingsForm } from './site-settings-form'
import { SecurityPanel } from './security-panel'
import { apiLogout } from '@/lib/api-client'
import { PageMetaManager } from './page-meta-manager'
import { ServicesManager } from './services-manager'
import { CasesManager } from './cases-manager'
import { FaqManager } from './faq-manager'
import { SimpleItemsManager } from './simple-items-manager'
import { HomeContentEditor } from './home-content-editor'
import { CtaEditor } from './cta-editor'
import { AboutEditor } from './about-editor'
import { FooterEditor } from './footer-editor'
import { LeadsManager } from './leads-manager'
import { PrivacyManager } from './privacy-manager'
import { SocialLinksManager } from './social-links-manager'
import {
  apiListExpertise, apiCreateExpertise, apiUpdateExpertise, apiDeleteExpertise,
  apiListWhyUs, apiCreateWhyUs, apiUpdateWhyUs, apiDeleteWhyUs,
} from '@/lib/api-client'

type AdminPanelProps = {
  onExit: () => void
}

export function AdminPanel({ onExit }: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('home-content')

  const handleLogout = async () => {
    await apiLogout()
    onExit()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="md:pl-64">
        <AdminSidebar
          active={tab}
          onTabChange={setTab}
          onExit={onExit}
          onLogout={handleLogout}
        />
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {tab === 'home-content' && <HomeContentEditor />}
          {tab === 'expertise' && (
            <SimpleItemsManager
              title="Экспертиза"
              description="Что мы умеем — секция на главной"
              sectionTitleField="expertiseSectionTitle"
              sectionTextField="expertiseSectionText"
              onList={apiListExpertise}
              onCreate={apiCreateExpertise}
              onUpdate={apiUpdateExpertise}
              onDelete={apiDeleteExpertise}
            />
          )}
          {tab === 'services' && <ServicesManager />}
          {tab === 'why-us' && (
            <SimpleItemsManager
              title="Почему мы"
              description="Преимущества — секция на главной"
              sectionTitleField="whyUsSectionTitle"
              sectionTextField="whyUsSectionText"
              onList={apiListWhyUs}
              onCreate={apiCreateWhyUs}
              onUpdate={apiUpdateWhyUs}
              onDelete={apiDeleteWhyUs}
            />
          )}
          {tab === 'cases' && <CasesManager />}
          {tab === 'faq' && <FaqManager />}
          {tab === 'cta' && <CtaEditor />}
          {tab === 'about' && <AboutEditor />}
          {tab === 'footer' && <FooterEditor />}
          {tab === 'socials' && <SocialLinksManager />}
          {tab === 'articles' && <ArticlesManager type="ARTICLE" />}
          {tab === 'leads' && <LeadsManager />}
          {tab === 'privacy' && <PrivacyManager />}
          {tab === 'page-meta' && <PageMetaManager />}
          {tab === 'settings' && <SiteSettingsForm />}
          {tab === 'security' && <SecurityPanel onLoggedOut={onExit} />}
        </main>
      </div>
    </div>
  )
}
