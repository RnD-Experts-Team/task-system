import { memo } from "react"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

export const CRITICAL_DEADLINES = [
  { id: 1, title: "Finalize Q4 Strategy", due: "Today, 05:00 PM", urgency: "urgent" as const },
  { id: 2, title: "Design Review — Apollo", due: "Tomorrow, 10:30 AM", urgency: "high" as const },
  { id: 3, title: "Client Demo Preparation", due: "Apr 3, 02:00 PM", urgency: "medium" as const },
]

export default memo(function DeadlineItem({ item }: { item: (typeof CRITICAL_DEADLINES)[number] }) {
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
