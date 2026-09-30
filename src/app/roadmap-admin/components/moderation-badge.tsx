import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ModerationState } from "../types"

const STYLES: Record<ModerationState, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  approved: {
    label: "Approved",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    className: "border-red-500/30 bg-red-500/15 text-red-700 dark:text-red-400",
  },
  spam: {
    label: "Spam",
    className: "border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-400",
  },
}

export function ModerationBadge({ state, className }: { state: ModerationState; className?: string }) {
  const style = STYLES[state]
  return (
    <Badge variant="outline" className={cn(style.className, className)}>
      {style.label}
    </Badge>
  )
}
