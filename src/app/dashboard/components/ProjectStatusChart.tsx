import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import type { ProjectStatusData } from "@/types"

// Color map for each project status slice
const STATUS_COLORS: Record<string, string> = {
  in_progress: "var(--color-primary)",
  pending: "oklch(0.577 0.245 27.325 / 50%)",
  done: "oklch(0.505 0.213 27.518 / 25%)",
  rated: "oklch(0.65 0.18 150 / 50%)",
}

/** Accepts project_status from the analytics API response */
export default function ProjectStatusChart({ data }: { data?: ProjectStatusData | null }) {
  // Build chart-ready array from by_status map
  const chartData = data
    ? Object.entries(data.by_status).map(([name, value]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
        color: STATUS_COLORS[name] ?? "var(--color-muted)",
      }))
    : []

  const total = chartData.reduce((s, d) => s + d.value, 0)
  const onTrackPct = total > 0 ? Math.round(((data?.average_progress ?? 0))) : 0

  return (
    <Card className="glass-glow border flex flex-col min-h-0">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-bold">Project Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center gap-8 min-h-0">
        {chartData.length > 0 ? (
          <>
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-heading text-2xl font-bold leading-none">{onTrackPct}%</span>
                <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground mt-1">Progress</span>
              </div>
            </div>

            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} aria-hidden="true" />
                  <span className="text-xs font-semibold text-foreground">{item.name}: <span className="text-muted-foreground">{item.value}</span></span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-6">No project data available.</p>
        )}
      </CardContent>
      {data && data.at_risk > 0 && (
        <CardFooter className="border-t border-border/20 px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-destructive font-semibold">
            <AlertTriangle className="size-3.5 shrink-0" />
            {data.at_risk} project{data.at_risk !== 1 ? "s" : ""} flagged at risk
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
