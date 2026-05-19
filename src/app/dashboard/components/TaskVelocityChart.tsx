import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TaskDistribution } from "@/types"

/** Accepts task_distribution from the analytics API response */
export default function TaskVelocityChart({ data }: { data?: TaskDistribution | null }) {
  // Build chart data from by_priority map
  const chartData = data
    ? Object.entries(data.by_priority).map(([name, value]) => ({
        label: name.charAt(0).toUpperCase() + name.slice(1),
        tasks: value,
      }))
    : []

  // Highlight the bar with the highest value
  const maxVal = Math.max(...chartData.map((d) => d.tasks), 0)
  return (
    <Card className="glass-glow border min-h-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base font-bold">Task Velocity</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {data?.overdue ? `${data.overdue} overdue` : "By Priority"}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={0}>
              <BarChart data={chartData} barSize={20}>
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  cursor={{ fill: "oklch(0.505 0.213 27.518 / 5%)" }}
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "0.75rem", fontSize: "0.75rem" }}
                  labelStyle={{ color: "var(--color-foreground)", fontWeight: 700 }}
                  itemStyle={{ color: "var(--color-primary)" }}
                />
                <Bar dataKey="tasks" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const isHighest = entry.tasks === maxVal
                    return (
                      <Cell key={`bar-${index}`} fill={isHighest ? "var(--color-primary)" : "oklch(0.505 0.213 27.518 / 30%)"} opacity={isHighest ? 1 : 0.7} />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* by_status breakdown */}
            {data?.by_status && (
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border/20 mt-2">
                {Object.entries(data.by_status).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <p className="text-sm font-black tabular-nums">{count}</p>
                    <p className="text-[10px] text-muted-foreground capitalize leading-tight">{status.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">No task data available.</p>
        )}
      </CardContent>
    </Card>
  )
}
