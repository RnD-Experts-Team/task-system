import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface Props {
  icon: LucideIcon
  title: string
  body?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, body, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-(--rm-accent-soft) text-(--rm-accent-strong)">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className="text-base font-semibold tracking-tight text-balance">{title}</h3>
      {body ? <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
