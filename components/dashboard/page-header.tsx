import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  highlightedText: string
  description: string
  action?: ReactNode
}

export function PageHeader({ title, highlightedText, description, action }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
            {title} <span className="text-primary font-normal">{highlightedText}</span>
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            {description}
          </p>
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="h-px bg-linear-to-r from-primary via-primary/50 to-transparent" />
    </div>
  )
}

