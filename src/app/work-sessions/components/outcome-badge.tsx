import { CheckCircle2, CircleDashed, MinusCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OUTCOME_LABELS, type ItemOutcome } from "../types"

// Tone classes per outcome — done emerald, partial amber, not_done red, pending muted
const outcomeClasses: Record<ItemOutcome, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  not_done: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
}

const outcomeIcons = {
  pending: CircleDashed,
  done: CheckCircle2,
  partial: MinusCircle,
  not_done: XCircle,
} as const

/** Pill badge for an item's outcome (pending / done / partial / not done) */
export function OutcomeBadge({ outcome }: { outcome: ItemOutcome }) {
  const Icon = outcomeIcons[outcome]
  return (
    <Badge variant="outline" className={cn("gap-1", outcomeClasses[outcome])}>
      <Icon />
      {OUTCOME_LABELS[outcome]}
    </Badge>
  )
}
