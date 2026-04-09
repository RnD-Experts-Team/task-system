import { memo } from "react"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UpcomingDeadline } from "@/types"

// Shape for a single deadline row shown in the card
export interface DeadlineRow {
  id: number
  title: string
  due: string
  urgency: "urgent" | "high" | "medium"
}

/** Map API upcoming_deadlines to display rows */
export function buildDeadlineRows(deadlines: UpcomingDeadline[] | undefined): DeadlineRow[] {
  if (!deadlines?.length) return []
  return deadlines.slice(0, 5).map((d) => ({
    id: d.id,
    title: d.name,
    due: d.due_date,
    // Determine urgency from days until due
    urgency: d.days_until_due <= 1 ? "urgent" : d.days_until_due <= 3 ? "high" : "medium",
  }))
}

export default memo(function DeadlineItem({ item }: { item: DeadlineRow }) {
  const config = {
    urgent: { border: "border-destructive", bg: "bg-destructive/5", badge: "bg-destructive/10 text-destructive", label: "Urgent" },
    high: { border: "border-primary", bg: "bg-primary/5", badge: "bg-primary/10 text-primary", label: "High" },
    medium: { border: "border-border", bg: "bg-muted/30", badge: "bg-muted text-muted-foreground", label: "Medium" },
  }[item.urgency]

  return (
    <div className={cn("flex flex-col gap-2 rounded-r-xl border-l-[3px] p-4", config.border, config.bg)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-tight">{item.title}</p>
        <span className={cn("shrink-0 rounded px-2 py-0.5 text-[10px] font-black uppercase", config.badge)}>{config.label}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="size-3 shrink-0" />
        <span>{item.due}</span>
      </div>
    </div>
  )
})
