'use client'

import {
  Megaphone, TrendingUp, Target, PenTool, Search, Share2, Mail,
  BarChart3, Users, Lightbulb, Award, Clock, CheckCircle2, Rocket,
  Zap, Globe, Code, Camera, MessageSquare, Star, Heart, ThumbsUp,
  Compass, LineChart, Megaphone as IconMegaphone, FileText, Settings,
  Briefcase, Headphones, Gift, Database, ShoppingCart, Smartphone,
  BookOpen, PieChart, Activity, Cpu, Layers, Eye, MousePointerClick,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Github, Twitch,
  Slack, Dribbble, Send, MessageCircle, Rss, Link2, AtSign, Phone,
  MapPin, type LucideIcon,
} from 'lucide-react'

/**
 * Карта имён иконок → компоненты Lucide.
 * Используется для рендеринга иконок, заданных строкой в БД.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  megaphone: Megaphone,
  'trending-up': TrendingUp,
  target: Target,
  'pen-tool': PenTool,
  search: Search,
  share: Share2,
  mail: Mail,
  bar_chart: BarChart3,
  users: Users,
  lightbulb: Lightbulb,
  award: Award,
  clock: Clock,
  check_circle: CheckCircle2,
  rocket: Rocket,
  zap: Zap,
  globe: Globe,
  code: Code,
  camera: Camera,
  message_square: MessageSquare,
  star: Star,
  heart: Heart,
  thumbs_up: ThumbsUp,
  compass: Compass,
  line_chart: LineChart,
  file_text: FileText,
  settings: Settings,
  briefcase: Briefcase,
  headphones: Headphones,
  gift: Gift,
  database: Database,
  shopping_cart: ShoppingCart,
  smartphone: Smartphone,
  book_open: BookOpen,
  pie_chart: PieChart,
  activity: Activity,
  cpu: Cpu,
  layers: Layers,
  eye: Eye,
  mouse_click: MousePointerClick,
  // ─── Социальные сети ───
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  twitch: Twitch,
  slack: Slack,
  dribbble: Dribbble,
  telegram: Send,                 // Lucide нет бренда Telegram — используем Send
  whatsapp: MessageCircle,        // Lucide нет бренда WhatsApp — используем MessageCircle
  rss: Rss,
  link: Link2,
  at_sign: AtSign,
  phone: Phone,
  map_pin: MapPin,
}

/**
 * Список доступных иконок для выбора в админке.
 */
export const ICON_OPTIONS = Object.keys(ICON_MAP).map((key) => ({
  value: key,
  label: key.replace(/_/g, ' '),
  Icon: ICON_MAP[key],
}))

type DynamicIconProps = {
  name?: string | null
  /** Если задан — рендерится вместо Lucide-иконки */
  image?: string | null
  className?: string
  fallbackName?: string
  /** alt для изображения */
  alt?: string
  /** Стиль изображения (например, object-fit) */
  imgClassName?: string
}

/**
 * Рендерит иконку.
 * Приоритет: image (URL) > name (Lucide) > fallback.
 */
export function DynamicIcon({
  name,
  image,
  className,
  fallbackName = 'star',
  alt = 'icon',
  imgClassName,
}: DynamicIconProps) {
  if (image) {
    return (
       
      <img
        src={image}
        alt={alt}
        className={imgClassName || className || 'h-6 w-6 object-contain'}
        onError={(e) => {
          // Если изображение не загрузилось — скрываем, чтобы fallback сработал через CSS
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }
  const Icon = (name && ICON_MAP[name]) || ICON_MAP[fallbackName] || Star
  return <Icon className={className} />
}
