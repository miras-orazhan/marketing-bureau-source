'use client'

import { useState, useRef } from 'react'
import { ChevronDown, Image as ImageIcon, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ICON_OPTIONS, DynamicIcon } from '@/components/site/dynamic-icon'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type IconPickerProps = {
  /** Имя Lucide-иконки */
  value: string
  onChange: (name: string) => void
  /** URL кастомного изображения (приоритет над value) */
  imageUrl?: string | null
  onImageChange?: (url: string | null) => void
  /** Цвет превью (для иконок Lucide) */
  accentColor?: string
}

/**
 * Пикер иконки с визуальным превью:
 * - Поповер с гридом всех Lucide-иконок (кликабельные, с подсветкой выбранной)
 * - Поиск по имени
 * - Большое превью выбранной иконки над кнопкой
 * - Опционально: загрузка кастомного изображения (если передать onImageChange)
 */
export function IconPicker({
  value,
  onChange,
  imageUrl,
  onImageChange,
  accentColor = '#10b981',
}: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = ICON_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err?.error || 'Ошибка загрузки')
        return
      }
      const data = await res.json()
      onImageChange?.(data.url)
      toast.success('Изображение загружено')
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {/* Превью выбранной иконки */}
      <div className="flex items-center gap-3">
        <div
          className="h-14 w-14 rounded-lg flex items-center justify-center border bg-muted/30 shrink-0 overflow-hidden"
          style={{ backgroundColor: imageUrl ? 'transparent' : `${accentColor}1a` }}
        >
          <DynamicIcon
            name={value}
            image={imageUrl}
            className={cn('h-7 w-7', !imageUrl && 'text-foreground')}
            imgClassName="h-full w-full object-cover"
            alt="Иконка услуги"
          />
        </div>
        <div className="flex-1 min-w-0">
          {imageUrl ? (
            <p className="text-xs text-muted-foreground truncate">
              Кастомное изображение
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Lucide: <code className="bg-muted px-1 rounded">{value}</code>
            </p>
          )}
        </div>
      </div>

      {/* Кнопки выбора */}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <ChevronDown className="h-4 w-4 mr-1" />
              Выбрать иконку
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3" align="start">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск иконки..."
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <div className="max-h-72 overflow-y-auto grid grid-cols-6 gap-1.5">
                {filtered.map((opt) => {
                  const Icon = opt.Icon
                  const isSelected = opt.value === value && !imageUrl
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.label}
                      onClick={() => {
                        onChange(opt.value)
                        onImageChange?.(null) // сбрасываем кастомное изображение
                        setOpen(false)
                      }}
                      className={cn(
                        'h-10 w-10 rounded-md flex items-center justify-center border transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:bg-muted'
                      )}
                      style={isSelected ? { color: accentColor } : undefined}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
              {filtered.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Ничего не найдено
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {onImageChange && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4 mr-1" />
              )}
              Загрузить
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </>
        )}
      </div>

      {/* Кнопка сброса кастомного изображения */}
      {imageUrl && onImageChange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onImageChange(null)}
          className="text-destructive h-7 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Убрать изображение, использовать иконку
        </Button>
      )}
    </div>
  )
}
