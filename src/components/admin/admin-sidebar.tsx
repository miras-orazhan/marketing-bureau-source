'use client'

import {
  FileText, Settings, Eye, LogOut, ShieldCheck,
  Layout as LayoutIcon, Briefcase, HelpCircle, Award, Star,
  Search, Inbox, FileText as ArticleIcon, Megaphone, Info, PanelBottom,
  Share2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type AdminTab =
  | 'home-content'
  | 'expertise'
  | 'services'
  | 'why-us'
  | 'cases'
  | 'faq'
  | 'cta'
  | 'about'
  | 'footer'
  | 'socials'
  | 'articles'
  | 'leads'
  | 'privacy'
  | 'settings'
  | 'page-meta'
  | 'security'

type AdminSidebarProps = {
  active: AdminTab
  onTabChange: (tab: AdminTab) => void
  onExit: () => void
  onLogout: () => void
}

export function AdminSidebar({ active, onTabChange, onExit, onLogout }: AdminSidebarProps) {
  const groups: {
    label?: string
    items: { id: AdminTab; label: string; icon: React.ReactNode }[]
  }[] = [
    {
      label: 'Главная страница',
      items: [
        { id: 'home-content', label: 'HERO', icon: <LayoutIcon className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Секции',
      items: [
        { id: 'expertise', label: 'Экспертиза', icon: <Award className="h-4 w-4" /> },
        { id: 'services', label: 'Услуги', icon: <Briefcase className="h-4 w-4" /> },
        { id: 'why-us', label: 'Почему мы', icon: <Star className="h-4 w-4" /> },
        { id: 'cases', label: 'Кейсы', icon: <FileText className="h-4 w-4" /> },
        { id: 'faq', label: 'FAQ', icon: <HelpCircle className="h-4 w-4" /> },
        { id: 'cta', label: 'CTA-баннер', icon: <Megaphone className="h-4 w-4" /> },
        { id: 'about', label: 'О нас', icon: <Info className="h-4 w-4" /> },
        { id: 'footer', label: 'Футер', icon: <PanelBottom className="h-4 w-4" /> },
        { id: 'socials', label: 'Социальные сети', icon: <Share2 className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Блог',
      items: [
        { id: 'articles', label: 'Статьи', icon: <ArticleIcon className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Заявки',
      items: [
        { id: 'leads', label: 'Заявки с сайта', icon: <Inbox className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Система',
      items: [
        { id: 'privacy', label: 'Политика конфиденциальности', icon: <FileText className="h-4 w-4" /> },
        { id: 'settings', label: 'Настройки сайта', icon: <Settings className="h-4 w-4" /> },
        { id: 'page-meta', label: 'SEO по страницам', icon: <Search className="h-4 w-4" /> },
        { id: 'security', label: 'Безопасность', icon: <ShieldCheck className="h-4 w-4" /> },
      ],
    },
  ]

  return (
    <aside className="w-full md:w-64 md:min-h-screen bg-card border-r md:fixed md:top-0 md:left-0 md:z-30 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Панель управления</p>
          </div>
        </div>
      </div>

      <nav className="p-2 space-y-2">
        {groups.map((group, gi) => (
          <div key={gi} className="space-y-1">
            {gi > 0 && <div className="h-px bg-border mx-3 my-2" />}
            {group.label && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3 pt-1 pb-1">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left min-h-[40px]',
                  active === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-2 border-t mt-2 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="w-full justify-start text-sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Открыть сайт
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start text-sm text-destructive hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Выйти
        </Button>
      </div>
    </aside>
  )
}
