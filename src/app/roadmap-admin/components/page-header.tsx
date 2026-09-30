import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

type PageHeaderProps = {
  title: string
  description?: string
  /** Small uppercase badge next to the title (e.g. a count) */
  badge?: ReactNode
  /** Right-aligned actions */
  actions?: ReactNode
}

/** Page title block — same look as the other admin modules (text-3xl bold tracking-tight). */
export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {badge !== undefined && badge !== null && (
            <Badge variant="secondary" className="uppercase tracking-wider">
              {badge}
            </Badge>
          )}
        </div>
        {description && <p className="max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 self-start">{actions}</div>}
    </div>
  )
}
