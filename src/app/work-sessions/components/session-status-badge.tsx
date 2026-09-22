import { CheckCircle2, CircleDot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_LABELS, type WorkSessionStatus } from "../types"

// Tone classes per status — open = primary tint, confirmed = emerald
const statusClasses: Record<WorkSessionStatus, string> = {
  open: "bg-primary/10 text-primary border-primary/30",
  confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
}

/** Pill badge for a session's open / confirmed status */
export function SessionStatusBadge({ status }: { status: WorkSessionStatus }) {
  const Icon = status === "confirmed" ? CheckCircle2 : CircleDot
  return (
    <Badge variant="outline" className={cn("gap-1", statusClasses[status])}>
      <Icon />
      {STATUS_LABELS[status]}
    </Badge>
  )
}
