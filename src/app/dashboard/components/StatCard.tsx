import { memo, type ReactNode } from "react"
import { TiltCard } from "@/components/tilt-card"
import { CardContent } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

// Props for a single stat card — value is a string so the caller can format it
interface StatCardProps {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  icon: ReactNode
  highlight?: boolean
}

export default memo(function StatCard({ label, value, trend, trendUp, icon, highlight }: StatCardProps) {
  return (
    <TiltCard className={cn("glass-glow border transition-all duration-250 ease-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30", highlight && "border-primary/20")}>
      <CardContent className="p-6 sm:p-8 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
        <div className="flex items-end gap-3">
          <span className={cn("font-heading text-4xl sm:text-5xl font-black leading-none truncate", highlight ? "text-primary" : "text-foreground")}>
            {value}
          </span>
          {trend && (
            <span className={cn("mb-1 flex items-center gap-0.5 text-sm font-bold", trendUp ? "text-emerald-500" : "text-destructive")}>
              <TrendingUp className="size-3.5" />
              {trend}
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="rounded-xl bg-primary/10 p-2 inline-flex">{icon}</div>
        </div>
      </CardContent>
    </TiltCard>
  )
})
