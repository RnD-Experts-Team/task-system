import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { PRIORITY_LABELS, type ItemPriority } from "../types"

// Tone classes per priority — escalating from muted to red
const priorityClasses: Record<ItemPriority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  critical: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
}

/** Pill badge for an item's priority (low / medium / high / critical) */
export function PriorityBadge({ priority }: { priority: ItemPriority }) {
  return (
    <Badge variant="outline" className={cn(priorityClasses[priority])}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  )
}
