'use client'

type SectionHeaderProps = {
  label?: string
  title: string
  /** HTML-строка из rich-text editor (например, expertiseSectionText). Рендерится через dangerouslySetInnerHTML. */
  text?: string
  primaryColor: string
  accentColor: string
  center?: boolean
}

export function SectionHeader({
  label,
  title,
  text,
  primaryColor,
  accentColor,
  center = true,
}: SectionHeaderProps) {
  return (
    <div className={`space-y-3 mb-10 ${center ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}`}>
      {label && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: `${accentColor}1a`,
            color: accentColor,
          }}
        >
          {label}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: primaryColor }}>
        {title}
      </h2>
      {text && (
        // ВАЖНО: text — это HTML из rich-text editor (TipTap). Раньше рендерился
        // как {text} (React-экранирование → теги показывались как &lt;p&gt;).
        // Теперь через dangerouslySetInnerHTML — теги работают как настоящие.
        // .prose применяет Tailwind Typography (margin, line-height и т.д.).
        <div
          className="article-content prose prose-sm max-w-none text-muted-foreground leading-relaxed text-base md:text-lg"
          dangerouslySetInnerHTML={{ __html: text }}
        />
      )}
    </div>
  )
}
