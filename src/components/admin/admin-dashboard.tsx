'use client'

import { useState } from 'react'
import { FileText, Layout as LayoutIcon, Settings, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AdminTab } from './admin-sidebar'

type AdminDashboardProps = {
  onNavigate: (tab: AdminTab) => void
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const quickLinks: { tab: AdminTab; label: string; icon: React.ReactNode; desc: string }[] = [
    { tab: 'home-content', label: 'Секции страниц', icon: <LayoutIcon className="h-5 w-5" />, desc: 'HERO, Экспертиза, Услуги, Кейсы, FAQ, CTA, О нас, Футер' },
    { tab: 'articles', label: 'Статьи (блог)', icon: <FileText className="h-5 w-5" />, desc: 'Создание и редактирование статей' },
    { tab: 'leads', label: 'Заявки с сайта', icon: <Inbox className="h-5 w-5" />, desc: 'Заявки из CTA-форм' },
    { tab: 'page-meta', label: 'SEO по страницам', icon: <Settings className="h-5 w-5" />, desc: 'Meta-теги, Open Graph, schema.org' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-sm text-muted-foreground">Быстрый доступ к разделам админки</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map((q) => (
          <button
            key={q.tab}
            type="button"
            onClick={() => onNavigate(q.tab)}
            className="group bg-card border rounded-xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {q.icon}
              </div>
              <h3 className="font-semibold">{q.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{q.desc}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => onNavigate('services')} variant="outline">
          Услуги
        </Button>
        <Button onClick={() => onNavigate('cases')} variant="outline">
          Кейсы
        </Button>
        <Button onClick={() => onNavigate('faq')} variant="outline">
          FAQ
        </Button>
        <Button onClick={() => onNavigate('expertise')} variant="outline">
          Экспертиза
        </Button>
        <Button onClick={() => onNavigate('why-us')} variant="outline">
          Почему мы
        </Button>
        <Button onClick={() => onNavigate('privacy')} variant="outline">
          Политика конфиденциальности
        </Button>
        <Button onClick={() => onNavigate('settings')} variant="outline">
          Настройки сайта
        </Button>
      </div>
    </div>
  )
}
