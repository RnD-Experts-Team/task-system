import { memo } from "react"
import { AlertCircle, HelpCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HelpRequestsStats } from "@/types"

// Shape for a single help request row shown in the list
export interface HelpRequestRow {
  id: number
  title: string
  reporter: string
  time: string
  priority: "high" | "medium" | "low"
}

/** Map API help_requests_stats to display rows (top helpers as preview) */
export function buildHelpRequestRows(stats: HelpRequestsStats | undefined): HelpRequestRow[] {
  if (!stats) return []
  // Show a summary row per stat bucket so the UI is never empty
  const rows: HelpRequestRow[] = []
  if (stats.pending > 0)
    rows.push({ id: 1, title: `${stats.pending} pending help request(s)`, reporter: "System", time: "Now", priority: "high" })
  if (stats.completed > 0)
    rows.push({ id: 2, title: `${stats.completed} completed help request(s)`, reporter: "System", time: "Recently", priority: "low" })
  stats.top_helpers.forEach((h, i) =>
    rows.push({ id: 10 + i, title: `${h.user_name} helped ${h.help_count} time(s)`, reporter: h.user_name, time: "", priority: "medium" }),
  )
  return rows
}

export default memo(function HelpRequestItem({ item }: { item: HelpRequestRow }) {
  const iconMap = {
    high: <AlertCircle className="size-4 text-destructive" />,
    medium: <HelpCircle className="size-4 text-primary" />,
    low: <HelpCircle className="size-4 text-muted-foreground" />,
  }

  const bgMap = {
    high: "bg-destructive/10",
    medium: "bg-primary/10",
    low: "bg-muted",
  }

  return (
    <div className="group flex items-center justify-between rounded-xl p-4 transition-colors duration-200 hover:bg-muted/50 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={cn("size-9 rounded-full flex items-center justify-center shrink-0", bgMap[item.priority])}>
          {iconMap[item.priority]}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{item.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Reported by {item.reporter} · {item.time}</p>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
    </div>
  )
})
