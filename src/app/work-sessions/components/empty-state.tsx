import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

/** Dashed-border empty state — same look as the tasks page "no results" block */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-12 text-center">
      {Icon && (
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="size-5 text-primary" />
        </div>
      )}
      <p className="text-base font-semibold text-muted-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  )
}
