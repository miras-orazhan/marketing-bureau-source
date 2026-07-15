'use client'

type SectionHeaderProps = {
  label?: string
  title: string
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
        <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
          {text}
        </p>
      )}
    </div>
  )
}
