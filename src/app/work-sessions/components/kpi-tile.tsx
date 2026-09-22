// src/app/work-sessions/components/kpi-tile.tsx
// Compact stat card — same look as the summary cards on the weighted-ratings
// page (uppercase label, bold value, muted hint, icon chip on the right).

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type KpiTone = "default" | "good" | "warn" | "bad"

type KpiTileProps = {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: LucideIcon
  tone?: KpiTone
  className?: string
}

// Icon chip + value color per tone
const toneStyles: Record<KpiTone, { chip: string; icon: string; value: string }> = {
  default: { chip: "bg-primary/10", icon: "text-primary", value: "text-foreground" },
  good: {
    chip: "bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-700 dark:text-emerald-400",
  },
  warn: {
    chip: "bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400",
    value: "text-amber-700 dark:text-amber-400",
  },
  bad: {
    chip: "bg-red-500/10",
    icon: "text-red-600 dark:text-red-400",
    value: "text-red-700 dark:text-red-400",
  },
}

export function KpiTile({ label, value, hint, icon: Icon, tone = "default", className }: KpiTileProps) {
  const styles = toneStyles[tone]
  return (
    <Card className={cn("transition-all hover:border-primary/20 hover:shadow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums tracking-tight", styles.value)}>{value}</p>
            {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
          </div>
          {Icon && (
            <div className={cn("shrink-0 rounded-lg p-2", styles.chip)}>
              <Icon className={cn("size-4", styles.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
