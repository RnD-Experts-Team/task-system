import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

export function SystemInsights() {
  return (
    <div className="rounded-3xl border border-border/10 bg-card/60 p-6 backdrop-blur-xl sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-primary">
          System Insights
        </h3>
        <BarChart3 className="size-4 text-primary" />
      </div>
      <div className="space-y-4">
        <InsightBar label="Late Arrivals" value="4.5%" percent={45} variant="warning" />
        <InsightBar label="Overtime Alerts" value="12" percent={75} variant="primary" />
      </div>
      <Button variant="outline" className="mt-6 w-full text-[10px] font-bold uppercase tracking-widest">
        Generate Weekly Report
      </Button>
    </div>
  )
}

function InsightBar({
  label,
  value,
  percent,
  variant,
}: {
  label: string
  value: string
  percent: number
  variant: "primary" | "warning"
}) {
  return (
    <div className="rounded-2xl bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className={`text-xs font-bold ${variant === "warning" ? "text-orange-400" : "text-primary"}`}
        >
          {value}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
        <div
          className={`h-full rounded-full ${variant === "warning" ? "bg-orange-400" : "bg-primary"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
