import { memo } from "react"
import { AlertCircle, HelpCircle, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export const HELP_REQUESTS = [
  { id: 1, title: "Database connection timeout error", reporter: "Alex G.", time: "2 hours ago", priority: "high" as const },
  { id: 2, title: "Inquiry about API rate limits", reporter: "Fintech Inc.", time: "5 hours ago", priority: "medium" as const },
  { id: 3, title: "UI glitch on the reports screen", reporter: "Dana L.", time: "Yesterday", priority: "low" as const },
]

export default memo(function HelpRequestItem({ item }: { item: (typeof HELP_REQUESTS)[number] }) {
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
