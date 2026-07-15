'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { TextAlign } from '@tiptap/extension-text-align'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code,
  Minus,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  RemoveFormatting,
  Pilcrow,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type ToolButtonProps = {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolButton({ onClick, active, disabled, title, children }: ToolButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </Button>
  )
}

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Начните писать...',
  className,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [colorOpen, setColorOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: false,
        underline: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: 'rt-image' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'rt-link' },
      }),
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none min-h-[300px] focus:outline-none',
          'p-4 leading-relaxed'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
  })

  // Сброс содержимого, когда внешний value становится пустым
  useEffect(() => {
    if (!editor) return
    if (value === '' && editor.getHTML() !== '') {
      editor.commands.setContent('', { emitUpdate: false })
    }

  }, [value])

  if (!editor) {
    return (
      <div className="border rounded-md min-h-[340px] flex items-center justify-center text-muted-foreground text-sm">
        Загрузка редактора…
      </div>
    )
  }

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err?.error || 'Ошибка загрузки изображения')
      return
    }
    const data = await res.json()
    editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run()
    toast.success('Изображение добавлено')
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await handleImageUpload(file)
    e.target.value = ''
  }

  const currentBlock =
    editor.isActive('heading', { level: 1 }) ? 'h1' :
    editor.isActive('heading', { level: 2 }) ? 'h2' :
    editor.isActive('heading', { level: 3 }) ? 'h3' :
    editor.isActive('heading', { level: 4 }) ? 'h4' :
    'p'

  const currentLink = (editor.getAttributes('link').href as string) || ''

  return (
    <div className={cn('border rounded-md overflow-hidden bg-background', className)}>
      {/* Тулбар */}
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
        <ToolButton title="Отменить (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Повторить (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-4 w-4" />
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-border" />

        <Select
          value={currentBlock}
          onValueChange={(v) => {
            if (v === 'p') editor.chain().focus().setParagraph().run()
            else if (v === 'h1') editor.chain().focus().setHeading({ level: 1 }).run()
            else if (v === 'h2') editor.chain().focus().setHeading({ level: 2 }).run()
            else if (v === 'h3') editor.chain().focus().setHeading({ level: 3 }).run()
            else if (v === 'h4') editor.chain().focus().setHeading({ level: 4 }).run()
          }}
        >
          <SelectTrigger className="h-8 w-[150px]">
            <SelectValue placeholder="Стиль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Обычный текст</SelectItem>
            <SelectItem value="h1">Заголовок 1</SelectItem>
            <SelectItem value="h2">Заголовок 2</SelectItem>
            <SelectItem value="h3">Подзаголовок 3</SelectItem>
            <SelectItem value="h4">Подзаголовок 4</SelectItem>
          </SelectContent>
        </Select>

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolButton title="Жирный (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Курсив (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Подчёркнутый (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Зачёркнутый" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Выделение текста" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          <Highlighter className="h-4 w-4" />
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolButton title="По левому краю" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="По центру" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="По правому краю" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="По ширине" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify className="h-4 w-4" />
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolButton title="Маркированный список" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Нумерованный список" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Список задач" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks className="h-4 w-4" />
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-border" />

        <ToolButton title="Цитата" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Код (блок)" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Разделитель" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-4 w-4" />
        </ToolButton>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Ссылка */}
        <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant={editor.isActive('link') ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              title="Вставить ссылку"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Вставить ссылку</DialogTitle>
            </DialogHeader>
            <LinkForm
              initialUrl={currentLink}
              onApply={(url) => {
                if (!url) editor.chain().focus().unsetLink().run()
                else editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
                setLinkOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Изображение */}
        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Вставить изображение">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Вставить изображение</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setImageOpen(false)
                  setTimeout(() => fileInputRef.current?.click(), 100)
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Загрузить с компьютера
              </Button>
              <div className="text-center text-xs text-muted-foreground">— или —</div>
              <div className="space-y-2">
                <Label htmlFor="img-url">URL изображения</Label>
                <Input id="img-url" placeholder="https://example.com/image.jpg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="img-alt">Alt-текст (описание)</Label>
                <Input id="img-alt" placeholder="Что изображено" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Отмена</Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={() => {
                    const urlEl = document.getElementById('img-url') as HTMLInputElement
                    const altEl = document.getElementById('img-alt') as HTMLInputElement
                    const url = urlEl?.value?.trim()
                    if (!url) {
                      toast.error('Введите URL изображения')
                      return
                    }
                    editor.chain().focus().setImage({ src: url, alt: altEl?.value?.trim() || '' }).run()
                    setImageOpen(false)
                  }}
                >
                  Вставить
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        <div className="mx-1 h-6 w-px bg-border" />

        {/* Цвет текста */}
        <Dialog open={colorOpen} onOpenChange={setColorOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Цвет текста">
              <span className="text-[14px] font-bold">A</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Цвет текста</DialogTitle>
            </DialogHeader>
            <ColorGrid onPick={(c) => {
              editor.chain().focus().setColor(c).run()
              setColorOpen(false)
            }} />
          </DialogContent>
        </Dialog>

        <ToolButton title="Очистить форматирование" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <RemoveFormatting className="h-4 w-4" />
        </ToolButton>
        <ToolButton title="Обычный абзац" active={currentBlock === 'p'} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow className="h-4 w-4" />
        </ToolButton>
      </div>

      {/* Контент */}
      <div className="rt-content max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────
// ФОРМА ССЫЛКИ
// ───────────────────────────────────────────────

function LinkForm({
  initialUrl,
  onApply,
}: {
  initialUrl: string
  onApply: (url: string) => void
}) {
  return (
    <div className="space-y-3 py-2">
      <div className="space-y-2">
        <Label htmlFor="link-url-input">URL</Label>
        <Input
          id="link-url-input"
          key={initialUrl}
          defaultValue={initialUrl}
          placeholder="https://example.com"
          autoFocus
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="ghost">Отмена</Button>
        </DialogClose>
        <Button
          type="button"
          onClick={() => {
            const input = document.getElementById('link-url-input') as HTMLInputElement
            onApply(input?.value?.trim() || '')
          }}
        >
          Применить
        </Button>
      </DialogFooter>
    </div>
  )
}

// ───────────────────────────────────────────────
// ПАЛИТРА ЦВЕТОВ
// ───────────────────────────────────────────────

function ColorGrid({ onPick }: { onPick: (c: string) => void }) {
  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#efefef', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff',
    '#ff00ff', '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8',
    '#cfe2f3', '#d9d2e9', '#ead1dc', '#4a86e8', '#06b6d4', '#10b981',
  ]
  return (
    <div className="grid grid-cols-8 gap-2 py-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className="h-7 w-7 rounded border hover:scale-110 transition-transform"
          style={{ backgroundColor: c }}
          onClick={() => onPick(c)}
          title={c}
        />
      ))}
    </div>
  )
}
